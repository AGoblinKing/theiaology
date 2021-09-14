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

  count = 0

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
        case EPhase.NORMAL:
        case EPhase.LIQUID:
          this.insert(i)
      }

      let tx = this.thrust.x(i),
        ty = this.thrust.y(i),
        tz = this.thrust.z(i)

      let vx = this.velocity.x(i) + tx * dx,
        vy = this.velocity.y(i) + ty * dx,
        vz = this.velocity.z(i) + tz * dx

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

      this.velocity.x(i, vx * 0.95)
      this.velocity.y(i, vy * 0.95)
      this.velocity.z(i, vz * 0.95)
    }

    for (let [k, v] of Object.entries($inserts)) {
      switch (this.matter.phase(parseInt(k, 10))) {
        case EPhase.STUCK:
          continue
      }

      if (!moves.has(v.i)) continue

      let collision = false

      this.future.vec3(v.i, $vec3)
      this.velocity.vec3(v.i, $vec3v)
      this.thrust.vec3(v.i, $vec3t).negate().multiplyScalar(2)

      $vec3v.negate().multiplyScalar(2)

      this.size.vec3(v.i, $vec3s)
      const phase = this.matter.phase(v.i)

      for (let collide of this.tree.search(v)) {
        // richocet off collides
        if (collide.i === v.i) continue
        collision = true

        collide.getCenter($vec3o).sub($vec3)
        if (phase === EPhase.LIQUID) {
          $vec3o
            .normalize()
            .negate()
            .multiply(
              $vec3t.set(
                1 + Math.random(),
                1 + Math.random(),
                1 + Math.random()
              )
            )
            .multiplyScalar(100)

          $vec3v.add($vec3o)
          if (this.matter.phase(collide.i) === EPhase.LIQUID) {
            this.velocity.x(collide.i, $vec3v.x * 0.5)
            this.velocity.y(collide.i, $vec3v.y * 0.5)
            this.velocity.z(collide.i, $vec3v.z * 0.5)
          }
        }
      }

      if (collision) {
        this.future.addX(v.i, $vec3t.x)
        this.future.addY(v.i, $vec3t.y)
        this.future.addZ(v.i, $vec3t.z)

        this.velocity.addX(v.i, $vec3v.x)
        this.velocity.addY(v.i, $vec3v.y)
        this.velocity.addZ(v.i, $vec3v.z)
      }
    }

    this.post(EMessage.PHYSICS_TICK)
    const isInsert = this.count % (1000 / this.tickrate) === 0
    this.count++

    isInsert && this.tree.clear()
    // collision phase
    isInsert && this.tree.load(Object.values($inserts))
  }
}

new Physics()

const $vec3o = new Vector3()
const $vec3v = new Vector3()
const $vec3s = new Vector3()
const $vec3t = new Vector3()
