import { AtomicInt } from 'src/buffer/atomic'
import { ENTITY_COUNT, IMPACTS_MAX_PER } from 'src/config'
import { EImpactReaction } from 'src/fate/weave'

export class Impact extends AtomicInt {
  // [who]
  static COUNT = IMPACTS_MAX_PER + 1

  constructor(shared = new SharedArrayBuffer(ENTITY_COUNT * Impact.COUNT * 4)) {
    super(shared)
  }

  reaction(id: number, resolver?: EImpactReaction) {
    return resolver === undefined
      ? Atomics.load(this, id * Impact.COUNT)
      : Atomics.store(this, id * Impact.COUNT, resolver)
  }

  impact(id: number, offset: number, who?: number) {
    return who === undefined
      ? Atomics.load(this, id * Impact.COUNT + offset)
      : Atomics.store(this, id * Impact.COUNT + offset, who)
  }
}
