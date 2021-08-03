import { COUNT } from 'src/config'
import { IntShared } from 'src/intshared'

// how together something is
export enum EPhase {
  SKIP = 0,
  SOLID,
  LIQUID,
  GAS,
  JELLY,
  STUCK,
}

// more for setting a pallete of colors
export enum EMatter {
  ROCK = 0xffaaaa,
  DIRT = 0xffcccc,
  WATER = 0x0000ff,
  SAND = 0xffff00,
  WOOD = 0x00ff00,
}

export class Matter extends IntShared {
  constructor(shared = new SharedArrayBuffer(COUNT * 3 * 4)) {
    super(shared)
  }
  phase(i: number, p?: EPhase) {
    return p !== undefined
      ? Atomics.store(this, i * 3, p)
      : Atomics.load(this, i * 3)
  }
  matter(i: number, m?: EMatter) {
    return m !== undefined
      ? Atomics.store(this, i * 3 + 1, m)
      : Atomics.load(this, i * 3 + 1)
  }
  interactor(i: number, e?: number) {
    return e !== undefined
      ? Atomics.store(this, i * 3 + 2, e)
      : Atomics.load(this, i * 3 + 2)
  }
}
