import { IAtomic } from 'src/buffer/atomic'
import { ICancel, Value } from 'src/value/value'

export type IMessage = IAtomic | number | object

export class SystemWorker extends Worker {
  _delay = 0
  _queue = []
  msg = new Value<any>()

  cancels: ICancel[] = []

  constructor(url: string) {
    super(url)

    this.onmessage = this.message.bind(this)
  }

  terminate() {
    super.terminate()
    this.cancels.forEach((c) => c())
  }

  // delay in ms before sending buffers
  delay(ms: number) {
    this._delay = ms
  }

  send(...buffers: IMessage[]) {
    for (let b of buffers) {
      // @ts-ignore - send the SharedArrayBuffer for our atomic types
      this.postMessage(b.sab !== undefined ? b.sab : b)
    }

    return this
  }

  waitForEntity(e: (msg: any) => void) {
    this._queue.push(e)
  }

  message(e: MessageEvent) {
    // >= 0 are eids while - are commands
    if (typeof e.data === 'number' && e.data >= 0) {
      const i = this._queue.pop()
      if (i) {
        i(e.data)
      }
    } else {
      this.msg.set(e.data)
    }
  }

  // pipe received messages to other worker
  pump(w: SystemWorker) {
    this.cancels.push(
      this.msg.on((data) => {
        switch (typeof data) {
          case 'number':
            w.postMessage(data)
            break
        }
      })
    )
    return this
  }

  // only relay numerical messages
  bind(w: SystemWorker) {
    this.cancels.push(
      w.msg.on((data) => {
        switch (typeof data) {
          case 'number':
            this.postMessage(data)
            break
        }
      })
    )
    return this
  }

  on(e: (data: any) => void) {
    this.cancels.push(this.msg.on(e))

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
