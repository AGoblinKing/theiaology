import { AtomicInt } from 'src/buffer/atomic'
import { System } from './system'

// add fuzz to the entire range
class Fuzz extends System {
  buffer: AtomicInt

  onmessage(e: MessageEvent) {
    this.buffer = new AtomicInt(e.data)
  }

  tick() {
    if (!this.buffer) return

    for (let i = 0; i < this.buffer.length; i++) {
      this.buffer.store(
        i,
        Math.floor(
          this.buffer.load(i === 0 ? this.buffer.length - 1 : i - 1) *
            (Math.random() * 4 - 2) +
            Math.random() * Number.MAX_SAFE_INTEGER
        )
      )
    }
  }
}

new Fuzz()
