import { Timeline } from 'src/channel/timeline'
import { Animation } from 'src/component/animation'
import { Impact } from 'src/component/impact'
import { Matter } from 'src/component/matter'
import { Scale } from 'src/component/scale'
import { SpaceTime } from 'src/component/spacetime'
import { Velocity } from 'src/component/velocity'
import { ENTITY_COUNT } from 'src/config'
import { System } from './system'

// Deal out entity IDs, execute timeline events
class Cardinal extends System {
  IDS = [...new Array(ENTITY_COUNT)].map((i) => i)

  animation: Animation
  past: SpaceTime
  future: SpaceTime
  velocity: Velocity
  impact: Impact
  matter: Matter
  scale: Scale
  timeline: Timeline

  constructor() {
    // run every 1/10th of a second
    super(100)
  }

  // receives buffers then IDs to free
  onmessage(e: MessageEvent) {
    switch (undefined) {
      case this.animation:
        this.animation = new Animation(e.data)
        break

      default:
    }
  }

  freeAll() {
    for (let i = 0; i < ENTITY_COUNT; i++) {
      this.free(i)
    }
  }

  free(i: number) {
    this.animation.free(i)
    this.future.free(i, SpaceTime.COUNT)
    this.past.free(i, SpaceTime.COUNT)
    this.velocity.free(i, Velocity.COUNT)
    this.matter.free(i, Matter.COUNT)
    this.impact.free(i, Impact.COUNT)
    this.scale.free(i, Velocity.COUNT)
  }

  available(i: number) {
    this.free(i)
    this.IDS.push(i)
  }

  reserve() {
    const i = this.IDS.pop()
    this.free(i)
    return i
  }
}

new Cardinal()
