import { AtomicInt } from 'src/buffer/atomic'
import { ENTITY_COUNT, IMPACTS_MAX_PER } from 'src/config'

export class Impact extends AtomicInt {
  // [who]
  static COUNT = IMPACTS_MAX_PER

  constructor(shared = new SharedArrayBuffer(ENTITY_COUNT * Impact.COUNT * 4)) {
    super(shared)
  }
}
