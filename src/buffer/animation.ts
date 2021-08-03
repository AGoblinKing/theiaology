import { Atomic } from 'src/atomic'
import { COUNT } from 'src/config'

export enum EAnimation {
  Normal = 0,
  NoEffects,
  Fire,
}

export class Animation extends Atomic {
  constructor(buffer = new SharedArrayBuffer(COUNT * 4)) {
    super(buffer)
  }
}
