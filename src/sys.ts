import { IAtomic } from 'src/atomic'

export class SystemWorker extends Worker {
  _delay = 0

  // delay in ms before sending buffers
  delay(ms: number) {
    this._delay = ms
  }
  send(...buffers: IAtomic[]) {
    setTimeout(() => {
      for (let b of buffers) {
        this.postMessage(b.sab)
      }
    }, this._delay)
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
