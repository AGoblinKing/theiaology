import { COUNT } from 'src/config'
import { IntShared } from 'src/intshared'

export enum EAnimation {
  Normal = 0,
  NoEffects,
  Fire,
}

export class Animation extends IntShared {
  constructor(buffer = new SharedArrayBuffer(COUNT * 4)) {
    super(buffer)
  }
}
