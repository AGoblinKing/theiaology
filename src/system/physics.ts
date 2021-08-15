// performs grid traversal and collision detection
import { Impact } from 'src/buffer/impact'
import { EPhase, Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Velocity } from 'src/buffer/velocity'
import { ENTITY_COUNT } from 'src/config'
import { Box3 } from 'three'
import { System } from './system'

const $box = new Box3()

// put each
const flat_spaces = {}

class Physics extends System {
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Velocity
  size: Size
  impact: Impact
  ready = false
  // 50 frames a second, idealy get this to 5
  constructor() {
    super((1 / 60) * 1000)
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

    const t = Math.floor(performance.now())

    // rip through matter, update their grid_past/futures
    for (let i = 0; i < ENTITY_COUNT; i++) {
      switch (this.matter.phase(i)) {
        case EPhase.GHOST:
        case EPhase.STUCK:
          continue
      }

      let vx = this.velocity.x(i),
        vy = this.velocity.y(i),
        vz = this.velocity.z(i)

      if (vx !== 0 || vy !== 0 || vz !== 0) {
        this.future.addX(i, vx)
        const y = this.future.addY(i, vy)
        this.future.addZ(i, vz)
        this.future.time(i, t)

        if (y < 0) {
          this.future.y(i, 14000)
        }
      }
    }
  }
}

new Physics()

// periodacally update a voxels' sector
