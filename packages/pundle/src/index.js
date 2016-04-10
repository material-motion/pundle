'use strict'

/* @flow */

import { CompositeDisposable, Emitter } from 'sb-event-kit'
import { getPlugins, normalizeConfig } from './helpers'
import Path from './path'
import FileSystem from './file-system'
import Compilation from './compilation'
import type { Config, Plugin, WatcherConfig } from './types'
import type { Disposable } from 'sb-event-kit'

class Pundle {
  path: Path;
  config: Config;
  emitter: Emitter;
  fileSystem: FileSystem;
  subscriptions: CompositeDisposable;

  constructor(config: Config) {
    this.config = normalizeConfig(config)

    this.fileSystem = new FileSystem(this.config, new this.config.FileSystem(this.config))
    this.path = new Path(this.config, this.fileSystem)
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(this.path)
  }
  async loadPlugins(givenPlugins: Array<Plugin>): Promise {
    const plugins = await getPlugins(givenPlugins, this.path, this.config.rootDirectory)
    for (const { plugin, parameters } of plugins) {
      plugin(this, parameters)
    }
  }
  get(): Compilation {
    const compilation = new Compilation(this)
    this.emitter.emit('observe-compilations', compilation)
    this.subscriptions.add(compilation)
    compilation.onDidDestroy(() => {
      this.subscriptions.remove(compilation)
    })
    return compilation
  }
  async compile(generateSourceMap: boolean = false): Promise<string> {
    const compilation = this.get()
    await compilation.compile()
    let contents = compilation.generate()
    if (generateSourceMap) {
      contents += compilation.generateSourceMap(null, true)
    }
    return contents
  }
  watch(options: WatcherConfig): Disposable {
    return this.get().watch(options)
  }
  observeCompilations(callback: Function): Disposable {
    return this.emitter.on('observe-compilations', callback)
  }
  dispose() {
    this.subscriptions.dispose()
  }
}

module.exports = Pundle
