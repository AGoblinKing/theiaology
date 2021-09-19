import { AtomicInt } from 'src/buffer/atomic'
import { ATOM_COUNT } from 'src/config'

export class Matter extends AtomicInt {
  static COUNT = 3

  constructor(shared = new SharedArrayBuffer(ATOM_COUNT * Matter.COUNT * 4)) {
    super(shared)
  }

  red(i: number, r?: number) {
    return r !== undefined
      ? Atomics.store(this, i * Matter.COUNT, r)
      : Atomics.load(this, i * Matter.COUNT)
  }

  green(i: number, g?: number) {
    return g !== undefined
      ? Atomics.store(this, i * Matter.COUNT + 1, g)
      : Atomics.load(this, i * Matter.COUNT + 1)
  }

  blue(i: number, b?: number) {
    return b !== undefined
      ? Atomics.store(this, i * Matter.COUNT + 2, b)
      : Atomics.load(this, i * Matter.COUNT + 2)
  }
}
