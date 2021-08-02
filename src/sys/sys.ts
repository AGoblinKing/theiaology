import { AtomicBuffer } from 'src/atomic'

export class SystemWorker extends Worker {
  add(atomic: AtomicBuffer) {
    this.postMessage(atomic.$)
    return this
  }
}

// How to spin up and communicate with systems
export class Sys {
  $: Set<SystemWorker>

  constructor() {
    this.$ = new Set()
  }

  manifest(url: string): SystemWorker {
    const w = new SystemWorker(`/build/${url}.js`)
    this.$.add(w)
    return w
  }

  destroy(worker: SystemWorker) {
    worker.terminate()
    this.$.delete(worker)
  }
}

export const sys = new Sys()
