import { Animation } from 'src/buffer/animation'
import { Impact } from 'src/buffer/impact'
import { Matter } from 'src/buffer/matter'
import { Scale } from 'src/buffer/scale'
import { SpaceTime } from 'src/buffer/spacetime'
import { EStatus, Status } from 'src/buffer/status'
import { Timeline } from 'src/buffer/timeline'
import { Velocity } from 'src/buffer/velocity'
import { ENTITY_COUNT } from 'src/config'
import { ECardinalMessage } from './message'
import { System } from './system'

// Deal out entity IDs, execute timeline events
class Cardinal extends System {
  IDS = [...new Array(ENTITY_COUNT)].map((i) => i)

  // entity components
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Velocity
  scale: Scale
  impact: Impact
  animation: Animation
  status: Status

  // world components
  timeline: Timeline

  constructor() {
    // run every 1/10th of a second
    super(100)
  }

  // receives buffers then IDs to free
  onmessage(e: MessageEvent) {
    switch (undefined) {
      case this.past:
        this.past = new SpaceTime(e.data)
        break
      case this.future:
        this.future = new SpaceTime(e.data)
        break
      case this.matter:
        this.matter = new Matter(e.data)
        break
      case this.velocity:
        this.velocity = new Velocity(e.data)
        break
      case this.scale:
        this.scale = new Scale(e.data)
        break
      case this.animation:
        this.animation = new Animation(e.data)
        break
      case this.impact:
        this.impact = new Impact(e.data)
        break

      case this.status:
        this.status = new Status(e.data)
        break

      case this.timeline:
        this.timeline = new Timeline(e.data)
        break
      // expecting int EMessage
      default:
        if (typeof e.data !== 'number') return

        switch (e.data) {
          case ECardinalMessage.RequestID:
          case ECardinalMessage.TimelineUpdated:

          case ECardinalMessage.FreeAll:
            this.freeAll()
            break
        }
    }
  }

  freeAll() {
    for (let i = 0; i < ENTITY_COUNT; i++) {
      this.free(i)
    }
    this.IDS = [...new Array(ENTITY_COUNT)].map((i) => i)
  }

  free(i: number) {
    this.animation.free(i)
    this.future.free(i, SpaceTime.COUNT)
    this.past.free(i, SpaceTime.COUNT)
    this.velocity.free(i, Velocity.COUNT)
    this.matter.free(i, Matter.COUNT)
    this.impact.free(i, Impact.COUNT)
    this.scale.free(i, Velocity.COUNT)
    this.status.free(i)
  }

  available(i: number) {
    this.free(i)
    this.IDS.push(i)
  }

  reserve() {
    const i = this.IDS.pop()
    this.free(i)

    this.status.store(i, EStatus.Assigned)
    return i
  }

  tick() {
    // run through timeline
  }
}

new Cardinal()
