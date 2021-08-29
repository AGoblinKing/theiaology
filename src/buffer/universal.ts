import { AtomicInt } from 'src/buffer/atomic'
import { UNIVERSALS } from 'src/config'
import { EIdle } from 'src/timeline/def-timeline'

export class Universal extends AtomicInt {
  static COUNT = 11

  constructor(shared = new SharedArrayBuffer(4 * Universal.COUNT)) {
    super(shared)
    this.reset()
  }

  time(t?: number) {
    return t === undefined ? Atomics.load(this, 0) : Atomics.store(this, 0, t)
  }

  userSize(size?: number) {
    return size === undefined
      ? Atomics.load(this, 1)
      : Atomics.store(this, 1, size)
  }

  idle(idle?: EIdle) {
    return idle === undefined
      ? Atomics.load(this, 2)
      : Atomics.store(this, 2, idle)
  }

  clearColor(color?: number) {
    return color === undefined
      ? Atomics.load(this, 3)
      : Atomics.store(this, 3, color)
  }

  userX(x?: number) {
    return x === undefined ? Atomics.load(this, 4) : Atomics.store(this, 4, x)
  }

  userY(y?: number) {
    return y === undefined ? Atomics.load(this, 5) : Atomics.store(this, 5, y)
  }

  userZ(z?: number) {
    return z === undefined ? Atomics.load(this, 6) : Atomics.store(this, 6, z)
  }

  musicTime(t?: number) {
    return t === undefined ? Atomics.load(this, 7) : Atomics.store(this, 7, t)
  }

  userRX(rx?: number) {
    return rx === undefined ? Atomics.load(this, 8) : Atomics.store(this, 8, rx)
  }

  userRY(ry?: number) {
    return ry === undefined ? Atomics.load(this, 9) : Atomics.store(this, 9, ry)
  }
  userRZ(rz?: number) {
    return rz === undefined
      ? Atomics.load(this, 10)
      : Atomics.store(this, 10, rz)
  }

  reset() {
    for (let i = 0; i < UNIVERSALS.length; i++) {
      this.store(i, UNIVERSALS[i])
    }
    return this
  }
}
