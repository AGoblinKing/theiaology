import { AtomicInt } from 'src/buffer/atomic'
import { ATOM_COUNT } from 'src/config'

export enum EAnimation {
  NORMAL = 0,
  OFF,
  FIRE,
}

export class Animation extends AtomicInt {
  static COUNT = 1

  constructor(
    buffer = new SharedArrayBuffer(ATOM_COUNT * Animation.COUNT * 4)
  ) {
    super(buffer)
  }

  animation(i: number, animation?: EAnimation): EAnimation {
    return animation === undefined
      ? Atomics.load(this, Animation.COUNT * i)
      : Atomics.store(this, Animation.COUNT * i, animation)
  }
}
