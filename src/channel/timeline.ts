import { AtomicInt } from 'src/atomic'
import { TIMELINE_MAX } from 'src/config'

export enum ETimelineAction {
  NOTHING = 0,
  SPAWN,
}

// [ACTION, WHEN, WHAT, DATA1, DATA2]
export class Timeline extends AtomicInt {
  static COUNT = 5
  constructor(sab = new SharedArrayBuffer(4 * TIMELINE_MAX * Timeline.COUNT)) {
    super(sab)
  }

  action(index: number, action?: ETimelineAction): ETimelineAction {
    return action === undefined
      ? this.load(index * Timeline.COUNT)
      : this.store(index * Timeline.COUNT, action)
  }
}
