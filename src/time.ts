import { Uniform } from 'three'
import { ICancel, Value } from './valuechannel'

export const tick = new Value(0)
export const delta = new Value(0)
export const timestamp = new Value(0)

export function Loop($t) {
  delta.is(($t - timestamp.$) / 1000)
  timestamp.is($t)

  tick.is(tick.$ + 1)
}

export const timeUniform = new Uniform(0.0)
timestamp.on(($t) => {
  timeUniform.value = $t
})

export enum ETimelineEvent {
  NOTHING = 0,
  VOX,
}

export interface ITimelineEvent {
  time: number
  event: ETimelineEvent
}

export const $event_scratch = { time: 0, event: ETimelineEvent.NOTHING }

export class Timeline extends Value<Uint8Array> {
  eventCache: ITimelineEvent[] = []
  cursor: number = 0
  protected _stop: ICancel
  protected _stopCache: ICancel

  constructor(buffer: Uint8Array) {
    super(buffer)

    // react to sets and update cache
    this._stopCache = this.on(this.authorCache.bind(this))
  }

  // authoring functions
  authorCache() {}

  authorBuffer() {}

  setEvent(idx: number, $event: ITimelineEvent = $event_scratch) {}
  getEvent(idx: number, $event: ITimelineEvent = $event_scratch) {}

  doEvent(e: ITimelineEvent) {
    switch (e.event) {
      // spawn a VOX
      case ETimelineEvent.VOX:
        break
      default:
        break
    }
  }

  // run through eventCache
  tick(timer: number) {
    for (let i = this.cursor; i < this.eventCache.length; i++) {
      const $event = this.eventCache[i]
      if ($event.time <= timer) {
        this.doEvent($event)
        this.cursor = i
      } else {
        return
      }
    }
  }

  reset() {
    this.cursor = 0
  }

  start() {
    if (this._stop) return
    this._stop = timestamp.on(this.tick.bind(this))
  }

  pause() {
    this._stop()
    delete this._stop
  }

  stop() {
    this.pause()
    this.reset()
  }
}

export const timeline = new Timeline(new Uint8Array(0))
