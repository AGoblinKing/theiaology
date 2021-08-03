import { COUNT } from 'src/config'
import { IntShared } from 'src/intshared'

export class SpaceTime extends IntShared {
  constructor(shared = new SharedArrayBuffer(COUNT * 4 * 4)) {
    super(shared)
  }
  x(i: number, x?: number) {
    return x === undefined
      ? Atomics.load(this, i * 4)
      : Atomics.store(this, i * 4, x)
  }
  y(i: number, y?: number) {
    return y === undefined
      ? Atomics.load(this, i * 4 + 1)
      : Atomics.store(this, i * 4 + 1, y)
  }
  z(i: number, z?: number) {
    return z === undefined
      ? Atomics.load(this, i * 4 + 2)
      : Atomics.store(this, i * 4 + 2, z)
  }
  time(i: number, t?: number) {
    return t === undefined
      ? Atomics.load(this, i * 4 + 3)
      : Atomics.store(this, i * 4 + 3, t)
  }
}
