import { ATOM_COUNT } from 'src/config'
import { AtomicInt } from './atomic'

export enum ESenses {
  NONE = 0,
  SIGHT = 1,
  HEAR = 2,
  FEEL_RIGHT = 4,
  FEEL_LEFT = 8,
  FELT = 16,
  TASTE = 32,
}

// distance is on phys since its calced for every atom anyhow
export class Sensed extends AtomicInt {
  static COUNT = 3

  constructor(buffer = new SharedArrayBuffer(ATOM_COUNT * Sensed.COUNT * 4)) {
    super(buffer)
  }

  id(i: number, id?: number): number {
    return id === undefined
      ? Atomics.load(this, Sensed.COUNT * i)
      : Atomics.store(this, Sensed.COUNT * i, id)
  }

  sense(i: number, sense?: number): number {
    return sense === undefined
      ? Atomics.load(this, Sensed.COUNT * i + 1)
      : Atomics.store(this, Sensed.COUNT * i + 1, sense)
  }

  pan(i: number, pan?: number): number {
    return pan === undefined
      ? Atomics.load(this, Sensed.COUNT * i + 2)
      : Atomics.store(this, Sensed.COUNT * i + 2, pan)
  }
}
