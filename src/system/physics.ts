// performs grid traversal and collision detection
import { Impact } from 'src/buffer/impact'
import { EPhase, Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ENTITY_COUNT, NORMALIZER } from 'src/config'
import { Box3, Vector3 } from 'three'
import { System } from './system'

const $box = new Box3()

const $box2 = new Box3()
const $box3 = new Box3()

const $min = new Vector3()
const $max = new Vector3()
const $vec = new Vector3()
const $vec2 = new Vector3()

const SECTORS = {
  ALPHA: new Vector3(-1, -1, -1),
  BETA: new Vector3(-1, -1, 1),
  GAMMA: new Vector3(-1, 1, 1),
  DELTA: new Vector3(1, 1, 1),
  EPSILON: new Vector3(1, -1, 1),
  ZETA: new Vector3(1, -1, -1),
  ETA: new Vector3(1, 1, -1),
  THETA: new Vector3(-1, 1, -1),
}

const SECTORSA = Object.values(SECTORS)

// put each
// each sector is indexed here, '442313' is a possible sector
const sectors = {}
// ids 2 sector
const ids = {}

// physics bounds
const $sector = new Box3(
  new Vector3(-NORMALIZER / 2, -NORMALIZER / 2, -NORMALIZER / 2),
  new Vector3(NORMALIZER, NORMALIZER, NORMALIZER)
)

class Physics extends System {
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Velocity
  size: Size
  impact: Impact
  universal: Universal

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
        break
      case this.universal:
        this.universal = new Universal(e.data)
        this.ready = true
        break
    }
  }

  collide(id1: number, id2: number) {
    // get their x y z and sizes and compare
    return this.box(id1, $box).intersectsBox(this.box(id2, $box2))
  }

  box(i: number, $bb: Box3 = $box) {
    const sx = this.size.x(i) / 2,
      sy = this.size.y(i) / 2,
      sz = this.size.z(i) / 2,
      x = this.future.x(i),
      y = this.future.y(i),
      z = this.future.z(i)

    // update their sector while you have their data

    $bb.min.set(x - sx, y - sy, z - sz), $bb.max.set(x + sx, y + sy, z + sz)
    return $bb
  }

  // calc and update sector
  sector(i: number, $bb?: Box3) {
    if (!$bb) $bb = this.box(i)

    let sector = $sector
    let width = Math.abs(sector.min.x - sector.max.x) / 2
    let height = Math.abs(sector.min.y - sector.max.y) / 2
    let depth = Math.abs(sector.min.z - sector.max.z) / 2

    for (let sector_depth = 0; sector_depth < 4; sector_depth++) {
      // check each sector if it contains the point
      let next_sector
      for (let i = 0; i < 8; i++) {
        const s = $vec
          .copy(SECTORSA[i])
          .multiply($vec2.set(width, height, depth))

        if (
          $box2
            .set(
              $min.set(s.x - width, s.y - height, s.z - depth),
              $max.set(s.x + width, s.y + height, s.z + depth)
            )
            .containsBox($bb)
        ) {
          // we have a match
          sector = $box3.copy($box2)
        }
      }
    }
  }

  tick() {
    if (!this.ready) return

    const t = Math.floor(performance.now())

    const mx = this.universal.minX()
    const my = this.universal.minY()
    const mz = this.universal.minZ()
    const max = this.universal.maxX()
    const may = this.universal.maxY()
    const maz = this.universal.maxZ()

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
        const x = this.future.addX(i, vx)
        const y = this.future.addY(i, vy)
        const z = this.future.addZ(i, vz)

        this.future.time(i, t)

        // warp out of bounds to other side

        if (x > max) {
          this.future.x(i, mx)
        } else if (x < mx) {
          this.future.x(i, max)
        }

        if (y > may) {
          this.future.y(i, my)
        } else if (y < my) {
          this.future.y(i, may)
        }

        if (z > maz) {
          this.future.z(i, mz)
        } else if (z < mz) {
          this.future.z(i, maz)
        }
      }
    }
  }
}

new Physics()

// periodacally update a voxels' sector
