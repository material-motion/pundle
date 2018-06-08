// @flow

import path from 'path'
import mime from 'mime/lite'
import invariant from 'assert'
import pick from 'lodash/pick'
import { Router } from 'express'

import getPundle, { type Master } from 'pundle-core'
import { getChunk, getUniqueHash, type Job, type ImportResolved } from 'pundle-api'

import { getOutputFormats, getChunksAffectedByImports } from './helpers'

type Payload = {
  configFileName?: string,
  configLoadFile?: boolean,
  directory?: string,
  // ^ Either directory to initialize pundle from or an instance

  hmr?: boolean,
  lazy?: boolean,
  // Used for chunk/image loading and HMR
  publicPath: string,
}
const PUNDLE_OPTIONS = ['configFileName', 'configLoadFile', 'directory']

export default async function getPundleDevMiddleware(options: Payload) {
  invariant(typeof options.publicPath === 'string', 'options.publicPath must be a string')

  const router = new Router()

  let { publicPath = '/' } = options
  if (!publicPath.endsWith('/')) {
    publicPath = `${publicPath}/`
  }

  const master: Master = await getPundle({
    ...pick(options, PUNDLE_OPTIONS),
    config: {
      entry: [require.resolve('./client/hmr-client')],
      output: {
        formats: await getOutputFormats(pick(options, PUNDLE_OPTIONS), publicPath),
        rootDirectory: '/tmp',
      },
    },
  })

  let firstTime = true
  let generated = null
  const filesChanged: Set<ImportResolved> = new Set()
  const hmrConnectedClients = new Set()
  const urlToContents = {}
  const urlToHMRContents = {}

  async function regenerateUrlCache({ chunks, job }) {
    const { outputs } = await master.generate(job, chunks)
    outputs.forEach(({ filePath, contents }) => {
      if (filePath) {
        urlToContents[filePath] = contents
      }
    })
  }
  async function generateForHMR({ changed, job }: { changed: Array<ImportResolved>, job: Job }) {
    if (!(changed.length && options.hmr && hmrConnectedClients.size)) {
      return
    }
    const hmrId = Date.now()
    const hmrChunksByFormat = {}
    changed.forEach(fileImport => {
      if (!hmrChunksByFormat[fileImport.format]) {
        hmrChunksByFormat[fileImport.format] = getChunk(fileImport.format, `hmr-${hmrId}`)
      }
      hmrChunksByFormat[fileImport.format].imports.push(fileImport)
    })
    const hmrChunks: $FlowFixMe = Object.values(hmrChunksByFormat)
    const { outputs } = await master.generate(job, hmrChunks)
    outputs.forEach(({ filePath, contents }) => {
      if (filePath) {
        urlToHMRContents[filePath] = contents
      }
    })
    const clientInfo = { changedFiles: changed.map(item => getUniqueHash(item)), urls: outputs.map(item => item.filePath) }
    hmrConnectedClients.forEach(client => {
      client.write(`${JSON.stringify(clientInfo)}\n`)
    })

    // Remove HMR contents from memory after 60 seconds
    setTimeout(() => {
      outputs.forEach(({ filePath }) => {
        if (filePath) {
          urlToHMRContents[filePath] = null
        }
      })
    }, 60 * 1000)
  }

  async function generateJobAsync({ job, changed }) {
    const transformedJob = await master.transformJob(job)
    const chunks = Array.from(transformedJob.chunks.values())
    if (firstTime) {
      firstTime = false
      await regenerateUrlCache({ job: transformedJob, chunks })
      return
    }
    const chunksToRegenerate = getChunksAffectedByImports(job, chunks, changed)

    if (chunksToRegenerate.length) {
      await regenerateUrlCache({ job: transformedJob, chunks: chunksToRegenerate })
    }
  }

  function generateJob({ job }) {
    if (!generated) {
      generated = generateJobAsync({ job, changed: Array.from(filesChanged.values()) })
      filesChanged.clear()
    }
    return generated
  }

  const { queue, job } = await master.watch({
    async generate({ changed }) {
      changed.forEach(fileImport => {
        filesChanged.add(fileImport)
      })
      generated = null
      await generateForHMR({ job, changed })
    },
  })
  if (!options.lazy) {
    await generateJob({ job })
  }

  function asyncRoute(callback: (req: Object, res: Object, next: Function) => Promise<void>) {
    return function(req, res, next) {
      callback(req, res, next).catch(error => {
        master.report(error)
        next(error)
      })
    }
  }

  router.get(`${publicPath}hmr`, function(req, res) {
    res.json({ enabled: !!options.hmr })
  })
  if (options.hmr) {
    router.get(`${publicPath}hmr/listen`, function(req, res) {
      hmrConnectedClients.add(res)
      res.on('close', function() {
        hmrConnectedClients.delete(res)
      })
    })
  }

  router.get(
    `${publicPath}*`,
    asyncRoute(async function(req, res, next) {
      let { url } = req
      if (url.endsWith('/')) {
        url = `${url}index.html`
      }

      function respondWith(output) {
        const mimeType = mime.getType(path.extname(url)) || 'application/octet-stream'
        res.set('content-type', mimeType)
        res.end(output)
      }

      const hmrContents = urlToHMRContents[url]
      if (hmrContents) {
        respondWith(hmrContents)
        return
      }

      await queue.waitTillIdle()
      await generateJob({ job })

      const contents = urlToContents[url]
      if (contents) {
        respondWith(contents)
        return
      }
      next()
    }),
  )

  return router
}
