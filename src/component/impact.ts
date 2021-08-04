import { AtomicInt } from 'src/atomic'
import { COUNT, IMPACTS_MAX } from 'src/config'

export class Impact extends AtomicInt {
  // [who]
  static BYTE_SIZE = IMPACTS_MAX

  constructor(shared = new SharedArrayBuffer(COUNT * Impact.BYTE_SIZE * 4)) {
    super(shared)
  }
}
