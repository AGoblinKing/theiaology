import { AtomicInt } from 'src/buffer/atomic'

export class Universal extends AtomicInt {
  static COUNT = 6

  constructor(shared = new SharedArrayBuffer(4 * Universal.COUNT)) {
    super(shared)
  }

  minX(x?: number) {
    return x === undefined ? Atomics.load(this, 0) : Atomics.store(this, 0, x)
  }
  minY(y?: number) {
    return y === undefined ? Atomics.load(this, 1) : Atomics.store(this, 1, y)
  }
  minZ(z?: number) {
    return z === undefined ? Atomics.load(this, 2) : Atomics.store(this, 2, z)
  }
  maxX(x?: number) {
    return x === undefined ? Atomics.load(this, 3) : Atomics.store(this, 3, x)
  }
  maxY(y?: number) {
    return y === undefined ? Atomics.load(this, 4) : Atomics.store(this, 4, y)
  }
  maxZ(z?: number) {
    return z === undefined ? Atomics.load(this, 5) : Atomics.store(this, 5, z)
  }
}
