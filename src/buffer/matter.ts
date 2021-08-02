import { AtomicBuffer } from 'src/atomic'
import { COUNT } from 'src/config'

// how together something is
export enum EPhase {
  SKIP = 0,
  SOLID,
  LIQUID,
  GAS,
  JELLY,
}

// more for setting a pallete of colors
export enum EMatter {
  ROCK = 0xffaaaa,
  DIRT = 0xffcccc,
  WATER = 0x0000ff,
  SAND = 0xffff00,
  WOOD = 0x00ff00,
}

export class Matter extends AtomicBuffer {
  constructor() {
    super(new Int32Array(new SharedArrayBuffer(COUNT * 3)))
  }
  phase(i: number, p?: EPhase) {
    return p !== undefined ? this.set(i * 3, p) : this.get(i * 3)
  }
  matter(i: number, m?: EMatter) {
    return m !== undefined ? this.set(i * 3 + 1, m) : this.get(i * 3 + 1)
  }
  interactor(i: number, e?: number) {
    return e !== undefined ? this.set(i * 3 + 2, e) : this.get(i * 3 + 2)
  }
}

export const matter = new Matter()
