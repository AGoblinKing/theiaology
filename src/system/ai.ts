import { Impact } from 'src/buffer/impact'
import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Thrust } from 'src/buffer/thrust'
import { ERole, Traits } from 'src/buffer/traits'
import { Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ATOM_COUNT } from 'src/config'
import { Vector3 } from 'three'
import { System } from './system'

const $vec3 = new Vector3()

class AI extends System {
  ready = false
  future: SpaceTime
  matter: Matter
  thrust: Thrust
  size: Size
  impact: Impact
  universal: Universal
  velocity: Velocity
  traits: Traits

  constructor() {
    super(200)
  }

  tick() {
    if (!this.ready) return

    for (let i = 0; i < ATOM_COUNT; i++) {
      switch (this.traits.role(i)) {
        case ERole.Hunter:
          this.hunt(i)
          break
      }
    }
  }

  hunt(i: number) {
    const avatar = this.universal.avatar()

    if (avatar === -1) return

    const avatarPos = this.future.vec3(avatar)
    const dst = this.future.vec3(i, $vec3).sub(avatarPos).length()

    // shoot at them with our velocity
    $vec3
      .negate()
      .normalize()
      .multiplyScalar(
        dst < 10000000 && this.impact.impact(i, 0) !== -1 ? 7 : 0.5
      )
      .multiplyScalar(Math.abs(this.thrust.y(i)))
    this.velocity.addX(i, $vec3.x)
    this.velocity.addY(i, $vec3.y)
    this.velocity.addZ(i, $vec3.z)
  }

  onmessage(e: MessageEvent) {
    switch (undefined) {
      case this.future:
        this.future = new SpaceTime(e.data)
        break
      case this.matter:
        this.matter = new Matter(e.data)
        break
      case this.thrust:
        this.thrust = new Thrust(e.data)
        break
      case this.size:
        this.size = new Size(e.data)
        break
      case this.impact:
        this.impact = new Impact(e.data)
        break
      case this.universal:
        this.universal = new Universal(e.data)
        break

      case this.velocity:
        this.velocity = new Velocity(e.data)
        break
      case this.traits:
        this.traits = new Traits(e.data)

        this.init()
        break
    }
  }

  init() {
    this.ready = true
  }
}

new AI()
