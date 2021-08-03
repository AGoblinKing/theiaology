import { IntShared } from 'src/intshared'
import { System } from './system'

// add fuzz to the entire range
class Fuzz extends System {
  buffer: IntShared

  onmessage(e: MessageEvent) {
    this.buffer = new IntShared(e.data)
  }

  tick() {
    if (!this.buffer) return

    for (let i = 0; i < this.buffer.length; i++) {
      const v = Math.floor(
        Atomics.load(this.buffer, i === 0 ? this.buffer.length - 1 : i - 1) *
          (Math.random() * 4 - 2) +
          Math.random() * Number.MAX_SAFE_INTEGER
      )

      Atomics.store(this.buffer, i, v)
    }
  }
}

new Fuzz()
