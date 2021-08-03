import { Atomic } from 'src/atomic'
import { System } from './system'

// add fuzz to the entire range
class Fuzz extends System {
  buffer: Atomic

  onmessage(e: MessageEvent) {
    this.buffer = new Atomic(e.data)
  }

  tick() {
    if (!this.buffer) return

    for (let i = 0; i < this.buffer.length; i++) {
      const v = Math.floor(
        this.buffer.load(i === 0 ? this.buffer.length - 1 : i - 1) *
          (Math.random() * 4 - 2) +
          Math.random() * Number.MAX_SAFE_INTEGER
      )

      this.buffer.store(i, v)
    }
  }
}

new Fuzz()
