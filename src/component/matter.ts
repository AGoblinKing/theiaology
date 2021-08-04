import { AtomicByte } from 'src/atomic'
import { COUNT } from 'src/config'

// how together something is
export enum EPhase {
  SKIP = 0,
  STUCK,
  SOLID,
  LIQUID,
  GAS,
}

// more for setting a pallete of colors
export enum EMatter {
  ROCK = 0xffaaaa,
  DIRT = 0xffcccc,
  WATER = 0x0000ff,
  SAND = 0xffff00,
  WOOD = 0x00ff00,
}

export class Matter extends AtomicByte {
  static COUNT = 2

  constructor(shared = new SharedArrayBuffer(COUNT * Matter.COUNT)) {
    super(shared)
  }
  phase(i: number, p?: EPhase) {
    return p !== undefined
      ? Atomics.store(this, i * Matter.COUNT, p)
      : Atomics.load(this, i * Matter.COUNT)
  }
  matter(i: number, m?: EMatter) {
    return m !== undefined
      ? Atomics.store(this, i * Matter.COUNT + 1, m)
      : Atomics.load(this, i * Matter.COUNT + 1)
  }
}
