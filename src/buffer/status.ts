import { AtomicByte } from 'src/buffer/atomic'
import { ENTITY_COUNT } from 'src/config'

export enum EStatus {
  Unassigned = 0,
  Assigned,
}

export class Status extends AtomicByte {
  constructor(buffer = new SharedArrayBuffer(ENTITY_COUNT)) {
    super(buffer)
  }
}
