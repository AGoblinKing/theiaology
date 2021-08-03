import { Atomic } from 'src/atomic'

export class SystemWorker extends Worker {
  send(...buffers: Atomic[]) {
    for (let b of buffers) {
      this.postMessage(b.sab)
    }
    return this
  }
}

// How to spin up and communicate with systems
export class Sys {
  $: Set<SystemWorker>

  constructor() {
    this.$ = new Set()
  }

  start(worker: string): SystemWorker {
    const w = new SystemWorker(`/build/${worker}.js`)
    this.$.add(w)
    return w
  }

  destroy(worker: SystemWorker) {
    worker.terminate()
    this.$.delete(worker)
  }
}

export const sys = new Sys()
