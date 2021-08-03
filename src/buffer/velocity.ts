import { Atomic } from 'src/atomic'
import { COUNT } from 'src/config'

export class Velocity extends Atomic {
  constructor(buffer = new SharedArrayBuffer(COUNT * 3 * 4)) {
    super(buffer)
  }
  x(i: number, x?: number) {
    return x === undefined
      ? Atomics.load(this, i * 3)
      : Atomics.store(this, i * 3, x)
  }
  y(i: number, y?: number) {
    return y === undefined
      ? Atomics.load(this, i * 3 + 1)
      : Atomics.store(this, i * 3 + 1, y)
  }
  z(i: number, z?: number) {
    return z === undefined
      ? Atomics.load(this, i * 3 + 2)
      : Atomics.store(this, i * 3 + 2, z)
  }
}
