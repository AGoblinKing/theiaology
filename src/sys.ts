import { IAtomic } from 'src/atomic'
import { Value } from './value'

export type IMessage = IAtomic | number | object

export class SystemWorker extends Worker {
  _delay = 0
  msg = new Value<any>()

  constructor(url: string) {
    super(url)

    this.onmessage = this.message.bind(this)
  }

  // delay in ms before sending buffers
  delay(ms: number) {
    this._delay = ms
  }

  send(...buffers: IMessage[]) {
    setTimeout(() => {
      for (let b of buffers) {
        // @ts-ignore - send the SharedArrayBuffer for our atomic types
        this.postMessage(b.sab !== undefined ? b.sab : b)
      }
    }, this._delay)
    return this
  }

  message(e: MessageEvent) {
    this.msg.set(e.data)
  }

  // pipe received messages to other worker
  pipe(w: SystemWorker) {
    this.msg.on((data) => {
      w.postMessage(data)
    })
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
    const w = new SystemWorker(`/build/${worker}.js?${Date.now()}`)
    this.$.add(w)
    return w
  }

  destroy(worker: SystemWorker) {
    worker.terminate()
    this.$.delete(worker)
  }
}

export const sys = new Sys()
