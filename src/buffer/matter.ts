import { AtomicInt } from 'src/buffer/atomic'
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
  NORMAL,
}

export class Matter extends AtomicInt {
  static COUNT = 4

  constructor(shared = new SharedArrayBuffer(ATOM_COUNT * Matter.COUNT * 4)) {
    super(shared)
  }

  red(i: number, r?: EPhase) {
    return r !== undefined
      ? Atomics.store(this, i * Matter.COUNT, r)
      : Atomics.load(this, i * Matter.COUNT)
  }

  green(i: number, g?: EPhase) {
    return g !== undefined
      ? Atomics.store(this, i * Matter.COUNT + 1, g)
      : Atomics.load(this, i * Matter.COUNT + 1)
  }

  blue(i: number, b?: EPhase) {
    return b !== undefined
      ? Atomics.store(this, i * Matter.COUNT + 2, b)
      : Atomics.load(this, i * Matter.COUNT + 2)
  }

  phase(i: number, p?: EPhase) {
    return p !== undefined
      ? Atomics.store(this, i * Matter.COUNT + 3, p)
      : Atomics.load(this, i * Matter.COUNT + 3)
  }
}
