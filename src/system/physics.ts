// performs grid traversal and collision detection
import { RBush3D } from 'rbush-3d'
import { Cage } from 'src/buffer/cage'
import { Impact } from 'src/buffer/impact'
import { EPhase, Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { ERealmState, Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ENTITY_COUNT } from 'src/config'
import { Box3, Vector3 } from 'three'
import { EMessage } from './sys-enum'
import { System } from './system'

const $box = new Box3()
const $box2 = new Box3()

const $vec3 = new Vector3()

class BBox extends Box3 {
  i: number
  constructor(i: number) {
    super()
    this.i = i
  }

  get minX() {
    return this.min.x
  }
  get minY() {
    return this.min.y
  }
  get minZ() {
    return this.min.z
  }
  get maxX() {
    return this.max.x
  }
  get maxY() {
    return this.max.y
  }
  get maxZ() {
    return this.max.z
  }
}

let $inserts: { [key: number]: BBox } = {}

class Physics extends System {
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Velocity
  size: Size
  impact: Impact
  universal: Universal
  cage: Cage

  // @ts-ignore
  tree = new RBush3D(4)
  ready = false
  // 50 frames a second, idealy get this to 5
  constructor() {
    super((1 / 15) * 1000)
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
        break
      case this.cage:
        this.cage = new Cage(e.data)
        this.init()
        break

      default:
        switch (e.data) {
          case EMessage.TIMELINE_UPDATE:
            $inserts = {}

            break
        }
    }
  }

  init() {
    this.ready = true
  }

  // these numbers change a bunch so better to just assign them to a tmp
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

  insert(i: number) {
    if (!$inserts[i]) $inserts[i] = new BBox(i)

    this.box(i, $inserts[i])
  }

  tick() {
    if (!this.ready || this.universal.state() !== ERealmState.RUNNING) return

    const t = this.universal.time()

    // rip through matter, update their grid_past/futures
    this.tree.clear()

    for (let i = 0; i < ENTITY_COUNT; i++) {
      const phase = this.matter.phase(i)
      switch (phase) {
        case EPhase.STUCK:
          this.insert(i)
          continue
      }

      let vx = this.velocity.x(i),
        vy = this.velocity.y(i),
        vz = this.velocity.z(i)

      if (vx !== 0 || vy !== 0 || vz !== 0) {
        let x = this.past.x(i, this.future.x(i))
        let y = this.past.y(i, this.future.y(i))
        let z = this.past.z(i, this.future.z(i))
        this.past.time(i, t)

        x = this.future.x(i, x + (vx * this.tickrate) / 50)
        y = this.future.y(i, y + (vy * this.tickrate) / 50)
        z = this.future.z(i, z + (vz * this.tickrate) / 50)

        this.future.time(i, t + this.tickrate * 2)

        const cX = this.cage.x(i),
          cY = this.cage.y(i),
          cZ = this.cage.z(i),
          cMX = this.cage.mX(i),
          cMY = this.cage.mY(i),
          cMZ = this.cage.mZ(i)

        const cageX = !(cX === 0 && cMX === 0),
          cageY = !(cY === 0 && cMY === 0),
          cageZ = !(cZ === 0 && cMZ === 0)

        if (cageX) {
          if (x > cMX) {
            this.future.x(i, cX)
          } else if (x < cX) {
            this.future.x(i, cMX)
          }
        }

        if (cageY) {
          if (y > cMY) {
            this.future.y(i, cY)
          } else if (y < cY) {
            this.future.y(i, cMY)
          }
        }

        if (cageZ) {
          if (z > cMZ) {
            this.future.z(i, cZ)
          } else if (z < cZ) {
            this.future.z(i, cMZ)
          }
        }

        switch (phase) {
          case EPhase.NORMAL:
            this.insert(i)
        }
        // warp out of bounds to other side
      }
    }

    // collision phase
    this.tree.load(Object.values($inserts))

    for (let [k, v] of Object.entries($inserts)) {
      switch (this.matter.phase(parseInt(k, 10))) {
        case EPhase.STUCK:
          continue
      }
      this.box(v.i, $box)
      this.size.vec3(v.i, $vec3)

      for (let collide of this.tree.search(v)) {
        // richocet off collides
        if (collide.i === v.i) continue
        // move the two objects away from one  another
        const dif = this.box(collide.i, $box2).intersect($box)

        dif.min.sub(dif.max).normalize()

        this.future.addX(v.i, dif.min.x * this.velocity.x(v.i))
        this.future.addY(v.i, dif.min.y * this.velocity.y(v.i))
        this.future.addZ(v.i, dif.min.z * this.velocity.z(v.i))
      }
    }
  }
}

new Physics()
