import { AtomicInt } from 'src/buffer/atomic'
import { ATOM_COUNT } from 'src/config'

export enum EAnimation {
  Normal = 0,
  NoEffects,
  Fire,
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
      ? Atomics.load(this, Animation.COUNT)
      : Atomics.store(this, Animation.COUNT, animation)
  }
}
