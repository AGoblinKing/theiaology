// performs grid traversal and collision detection
import { EPhase, Matter } from 'src/buffer/matter'
import { SpaceTime } from 'src/buffer/spacetime'
import { Velocity } from 'src/buffer/velocity'
import { System } from './system'

// TODO: split into sectors to go across multiple workers

class Physics extends System {
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Velocity
  // chance of a -1 velocity
  decay: 0.5

  private _physics_set = new Set<number>()

  onmessage(e: MessageEvent) {
    super.onmessage(e)
    if (!this.past) {
      this.past = new SpaceTime(e.data)
    } else if (!this.future) {
      this.future = new SpaceTime(e.data)
    } else if (!this.matter) {
      this.matter = new Matter(e.data)
    } else {
      this.velocity = new Velocity(e.data)
    }
  }

  hasPhysics(i: number) {
    return this._physics_set.add(i)
  }

  tick() {
    if (!this.velocity) return

    // rip through matter, update their grid_past/futures
    for (let i = 0; i < this.matter.$.length / 3; i++) {
      switch (this.matter.get(i * 3)) {
        case EPhase.SKIP:
          continue
        // woudl still update the oct tree
        case EPhase.STUCK:
          continue
      }

      const ix4 = i * 4
      const ix3 = i * 3

      const x = this.future.get(ix4),
        y = this.future.get(ix4 + 1),
        z = this.future.get(ix4 + 2),
        vx = this.velocity.get(ix3),
        vy = this.velocity.get(ix3 + 1),
        vz = this.velocity.get(ix3 + 2)

      // the future to the past
      this.past.set(ix4, x)
      this.past.set(ix4 + 1, y)
      this.past.set(ix4 + 2, z)
      this.past.set(ix4 + 3, this.future.get(ix4 + 3))

      // the edge of tomorrow
      if (vx !== 0 && vy !== 0 && vz !== 0) {
        this.future.set(ix4, x + vx)

        // keep things at 0 or above for height
        if (y + vy >= 0) {
          this.future.set(ix4 + 1, y + vy)
        }

        this.future.set(ix4 + 2, z + vz)
        this.future.set(ix4 + 3, Date.now())

        // decay velocity
        if (Math.random() > this.decay) {
          this.velocity.set(ix3, vx === 0 ? 0 : vx - Math.sign(vx))
          this.velocity.set(ix3 + 1, vy === 0 ? 0 : vy - Math.sign(vy))
          this.velocity.set(ix3 + 2, vz === 0 ? 0 : vz - Math.sign(vz))
        }
      }
    }

    for (let i = 0; i < this.matter.$.length / 3; i++) {
      // resolve collisions
    }
  }
}

new Physics()
