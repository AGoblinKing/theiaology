import { AtomicBuffer } from 'src/atomic'

// systems run as their own workers
export class System {
  buffers: AtomicBuffer[]

  constructor(tickrate: number = (1 / 5) * 1000) {
    // start up worker
    self.onmessage = this.onmessage.bind(this)
    this.buffers = []

    setInterval(this.tick.bind(this), tickrate)
  }

  onmessage(msg: MessageEvent) {
    this.buffers.push(new AtomicBuffer(msg.data))
  }

  tick() {}
}
