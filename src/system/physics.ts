importScripts('/build/three.js')

// performs grid traversal and collision detection
import { Impact } from 'src/buffer/impact'
import { EPhase, Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Velocity } from 'src/buffer/velocity'
import { PHYSICS_BOUNDS } from 'src/config'
import { EImpactReaction } from 'src/timeline/def-timeline'
import { Octree } from 'src/util/octree'
import { Box3, Vector3 } from 'three'
import { System } from './system'

const $box = new Box3()

class Physics extends System {
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Velocity
  size: Size
  impact: Impact

  ready = false
  // chance of a -1 velocity
  decay = 0.5

  octree = new Octree(
    new Box3(
      new Vector3(-PHYSICS_BOUNDS, -PHYSICS_BOUNDS, -PHYSICS_BOUNDS),
      new Vector3(PHYSICS_BOUNDS, PHYSICS_BOUNDS, PHYSICS_BOUNDS)
    )
  )

  constructor() {
    super(1000)
  }

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
      case this.size:
        this.size = new Size(e.data)
        break
      case this.impact:
        this.impact = new Impact(e.data)
        this.ready = true
        break
    }
  }

  box(i: number, $bb: Box3 = $box) {
    const sx = this.size.x(i) / 2,
      sy = this.size.y(i) / 2,
      sz = this.size.z(i) / 2,
      x = this.future.x(i),
      y = this.future.y(i),
      z = this.future.z(i)
    $bb.min.set(x - sx, y - sy, z - sz), $bb.max.set(x + sx, y + sy, z + sz)
    return $bb
  }

  tick() {
    if (!this.ready) return

    const t = performance.now()

    this.octree.reset()

    // add everyone to the octree
    for (let i = 0; i < this.matter.length / Matter.COUNT; i++) {
      switch (this.matter.phase(i)) {
        case EPhase.GHOST:
          continue
      }
      this.octree.insert(this.box(i), i)
    }

    // rip through matter, update their grid_past/futures
    for (let i = 0; i < this.matter.length / Matter.COUNT; i++) {
      switch (this.matter.phase(i)) {
        case EPhase.GHOST:
        case EPhase.STUCK:
          continue
      }

      let vx = this.velocity.x(i),
        vy = this.velocity.y(i),
        vz = this.velocity.z(i)

      // the future to the past
      this.past.x(i, this.future.x(i))
      this.past.y(i, this.future.y(i))
      this.past.z(i, this.future.z(i))
      this.past.time(i, this.future.time(i))

      // the edge of tomorrow
      // do move
      if (vx !== 0 && vy !== 0 && vz !== 0) {
        this.future.addX(i, vx)
        this.future.addY(i, vy)
        this.future.addZ(i, vz)

        const box = this.box(i)

        const collisions = this.octree.sample(box)

        // should collide with selves
        if (collisions.size > 1) {
          switch (this.impact.reaction(i)) {
            case EImpactReaction.DestroyBoth:
            case EImpactReaction.DestroyOther:
              for (let collision of collisions) {
                if (collision === i) continue

                this.post(collision)
              }
              // conditional fallthrough
              if (this.impact.reaction(i) === EImpactReaction.DestroyOther)
                break
            case EImpactReaction.Destroy:
              this.post(i)
              break
            case EImpactReaction.Respawn:
              // give back to the cardinal to respawn
              break
          }
        }

        // decay velocity
        if (Math.random() > this.decay) {
          this.velocity.addX(i, vx === 0 ? 0 : -Math.sign(vx))
          this.velocity.addY(i, vy === 0 ? 0 : -Math.sign(vy))
          this.velocity.addZ(i, vz === 0 ? 0 : -Math.sign(vz))
        }

        this.future.time(i, t + this.tickrate)
      }
    }
  }
}

new Physics()
