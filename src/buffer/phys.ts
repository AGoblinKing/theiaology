import { AtomicInt, IntToString, StringToInt } from 'src/buffer/atomic'
import { ATOM_COUNT } from 'src/config'

// how together something is
export enum EPhase {
  // doesn't get added to any collision
  GHOST,
  // doesn't exist according to physics
  VOID,
  // levels of reactivity
  LIQUID,
  // Doesn't move, but exists
  STUCK,
  FLOAT,
  DIVINE,
}

export enum ECarries {
  LEFT_HAND = -1,
  RIGHT_HAND = -2,
}

export class Phys extends AtomicInt {
  static COUNT = 8

  constructor(shared = new SharedArrayBuffer(ATOM_COUNT * Phys.COUNT * 4)) {
    super(shared)
  }

  phase(i: number, p?: EPhase) {
    return p !== undefined
      ? Atomics.store(this, i * Phys.COUNT, p)
      : Atomics.load(this, i * Phys.COUNT)
  }

  core(i: number, g?: number) {
    return g !== undefined
      ? Atomics.store(this, i * Phys.COUNT + 1, g)
      : Atomics.load(this, i * Phys.COUNT + 1)
  }

  carried(i: number, c?: number | ECarries) {
    return c !== undefined
      ? Atomics.store(this, i * Phys.COUNT + 2, c)
      : Atomics.load(this, i * Phys.COUNT + 2)
  }

  carries(i: number, c?: number) {
    return c !== undefined
      ? Atomics.store(this, i * Phys.COUNT + 3, c)
      : Atomics.load(this, i * Phys.COUNT + 3)
  }

  distance(i: number, d?: number) {
    return d !== undefined
      ? Atomics.store(this, i * Phys.COUNT + 4, d)
      : Atomics.load(this, i * Phys.COUNT + 4)
  }

  tag(i: number, f?: string) {
    return f !== undefined
      ? Atomics.store(this, i * Phys.COUNT + 5, StringToInt(f))
      : IntToString(Atomics.load(this, i * Phys.COUNT + 5))
  }

  tag2(i: number, f?: string) {
    return f !== undefined
      ? Atomics.store(this, i * Phys.COUNT + 6, StringToInt(f))
      : IntToString(Atomics.load(this, i * Phys.COUNT + 6))
  }

  spell(i: number, s?: number) {
    return s !== undefined
      ? Atomics.store(this, i * Phys.COUNT + 7, s)
      : Atomics.load(this, i * Phys.COUNT + 7)
  }
}
