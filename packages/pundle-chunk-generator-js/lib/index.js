// @flow

import fs from 'fs'
import path from 'path'
import { createChunkGenerator, getFileImportHash, type Job, type Chunk } from 'pundle-api'

import * as Helpers from './helpers'
import manifest from '../package.json'

const wrapper = fs.readFileSync(path.join(__dirname, 'wrapper', 'default.js'))

// TODO: have a config?
export default function() {
  return createChunkGenerator({
    name: 'pundle-chunk-generator-js',
    version: manifest.version,
    async callback(chunk: Chunk, job: Job, { getOutputPath }) {
      if (chunk.format !== 'js') return null

      const sourceMapPath = getOutputPath({
        id: chunk.id,
        format: `${chunk.format}.map`,
      })
      const { files, chunks } = Helpers.getContentForOutput(chunk, job)

      const output = [';(function(){', wrapper]
      let sourceMapOffset = Helpers.getLinesCount(output.join('\n')) + 1

      files.forEach(function(file) {
        const fileContents = `sbPundleModuleRegister(${JSON.stringify(
          file.id,
        )}, function(module, require, exports, __filename, __dirname) {\n${file.contents.toString()}\n});`
        if (sourceMapPath) {
          // TODO: Process source map because enabled
        }
        output.push(fileContents)
      })
      // TODO: Invoke chunk loaded success callbacks if available?
      if (chunk.entry) {
        const chunkEntryId = getFileImportHash(chunk.entry, chunk.format)
        output.push(
          `Object.assign(sbPundleEntries, ${JSON.stringify({
            [chunkEntryId]: chunk.id,
          })})`,
        )
        output.push(`sbPundleModuleGenerate('$root')(${JSON.stringify(chunkEntryId)})`)
      }

      output.push('})();')

      const outputs = [
        {
          format: chunk.format,
          contents: output.join('\n'),
        },
      ]

      if (sourceMapPath) {
        // Push the source map output
      }

      return outputs
    },
  })
}