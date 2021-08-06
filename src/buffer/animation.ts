import { AtomicInt } from 'src/atomic'
import { ENTITY_COUNT } from 'src/config'

export enum EAnimation {
  Normal = 0,
  NoEffects,
  Fire,
}

export class Animation extends AtomicInt {
  constructor(buffer = new SharedArrayBuffer(ENTITY_COUNT * 4)) {
    super(buffer)
  }
}
