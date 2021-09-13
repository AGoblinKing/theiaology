// performs grid traversal and collision detection
// Rbush-3d seems fast enough for now
// TODO: Trial against kd-tree, phys-x, revived gpgpu, and/or spherical
import { RBush3D } from 'rbush-3d'
import { Cage } from 'src/buffer/cage'
import { Impact } from 'src/buffer/impact'
import { EPhase, Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Thrust } from 'src/buffer/thrust'
import { ERealmState, Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ENTITY_COUNT } from 'src/config'
import { Box3, Vector3 } from 'three'
import { EMessage } from './enum'
import { System } from './system'

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

const $box = new BBox(0)

let $inserts: { [key: number]: BBox } = {}

class Physics extends System {
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  thrust: Thrust
  size: Size
  impact: Impact
  universal: Universal
  cage: Cage
  velocity: Velocity

  // @ts-ignore
  tree = new RBush3D(0)
  ready = false

  slowtree = 0

  constructor() {
    super((1 / 5) * 1000)
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
      case this.cage:
        this.cage = new Cage(e.data)

        break
      case this.velocity:
        this.velocity = new Velocity(e.data)

        this.init()
        break

      default:
        switch (e.data) {
          case EMessage.FATE_UPDATE:
            $inserts = {}

            break
        }
    }
  }

  init() {
    this.ready = true
  }

  // these numbers change a bunch so better to just assign them to a tmp
  box(i: number, $bb: BBox = $box) {
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
    if (!$inserts[i]) {
      $inserts[i] = new BBox(i)
    }

    return this.box(i, $inserts[i])
  }

  tick() {
    if (!this.ready || this.universal.state() !== ERealmState.RUNNING) return

    const t = this.universal.time()

    // rip through matter, update their grid_past/futures
    this.tree.clear()
    const moves = new Set()
    const dx = this.tickrate / 1000
    for (let i = 0; i < ENTITY_COUNT; i++) {
      const phase = this.matter.phase(i)
      switch (phase) {
        case EPhase.VOID:
          continue
        case EPhase.STUCK:
          this.insert(i)
          continue
        case EPhase.LIQUID:
          this.insert(i)
      }

      let tx = this.thrust.x(i),
        ty = this.thrust.y(i),
        tz = this.thrust.z(i)

      let vx = this.velocity.x(i) + tx,
        vy = this.velocity.y(i) + ty,
        vz = this.velocity.z(i) + tz

      if (vx !== 0 || vy !== 0 || vz !== 0) {
        moves.add(i)
        let x = this.past.x(i, this.future.x(i))
        let y = this.past.y(i, this.future.y(i))
        let z = this.past.z(i, this.future.z(i))
        this.past.time(i, t)

        x = this.future.x(i, x + vx)
        y = this.future.y(i, y + vy)
        z = this.future.z(i, z + vz)

        this.future.time(i, t + this.tickrate)

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
            this.past.x(i, cX)
          } else if (x < cX) {
            this.future.x(i, cMX)
            this.past.x(i, cMX)
          }
        }

        if (cageY) {
          if (y > cMY) {
            this.future.y(i, cY)
            this.past.y(i, cY)
          } else if (y < cY) {
            this.future.y(i, cMY)
            this.past.y(i, cMY)
          }
        }

        if (cageZ) {
          if (z > cMZ) {
            this.future.z(i, cZ)
            this.past.z(i, cZ)
          } else if (z < cZ) {
            this.future.z(i, cMZ)
            this.past.z(i, cMZ)
          }
        }
      }

      $vec3.set(vx, vy, vz).multiplyScalar(0.5)
      this.velocity.setVec3(i, $vec3)
    }

    // collision phase
    this.tree.load(Object.values($inserts))

    for (let [k, v] of Object.entries($inserts)) {
      switch (this.matter.phase(parseInt(k, 10))) {
        case EPhase.STUCK:
          continue
      }

      if (!moves.has(v.i)) continue

      let collision = false

      this.box(v.i, $box)
      this.future.vec3(v.i, $vec3)
      this.velocity.vec3(v.i, $vec3v)
      $vec3v.negate()
      this.size.vec3(v.i, $vec3s)
      const phase = this.matter.phase(v.i)

      for (let collide of this.tree.search(v)) {
        // richocet off collides
        if (collide.i === v.i) continue
        collision = true

        collide
          .getCenter($vec3o)
          .sub($vec3)
          .multiply($vec3v)
          .max($vec3s.negate())
          .min($vec3s.negate())
          .multiplyScalar(2)

        break
      }

      if (collision) {
        if (phase === EPhase.LIQUID) {
          this.future.setVec3(v.i, $vec3)
        } else {
          this.velocity.addX(v.i, $vec3v.x)
          this.velocity.addY(v.i, $vec3v.y)
          this.velocity.addZ(v.i, $vec3v.z)
        }
      }
    }

    this.post(EMessage.PHYSICS_TICK)
  }
}

new Physics()

const $vec3o = new Vector3()
const $vec3v = new Vector3()
const $vec3s = new Vector3()
