// performs grid traversal and collision detection
// Rbush-3d seems fast enough for now
// TODO: Trial against kd-tree, phys-x, revived gpgpu, and/or spherical
import { RBush3D } from 'rbush-3d'
import { Cage } from 'src/buffer/cage'
import { Impact } from 'src/buffer/impact'
import { Input } from 'src/buffer/input'
import { Matter } from 'src/buffer/matter'
import { EPhase, Phys } from 'src/buffer/phys'
import { BBox, Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Thrust } from 'src/buffer/thrust'
import { ERealmState, Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ATOM_COUNT, MAX_NORMAL_FORCE } from 'src/config'
import { Vector3 } from 'three'
import { EMessage } from './enum'
import { System } from './system'

const DECAY = 0.9
const $vec3 = new Vector3()
const $vec3r = new Vector3()
const $other = new BBox(-1)
const $me = new BBox()

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
  phys: Phys
  input: Input

  // @ts-ignore
  tree = new RBush3D(0)
  ready = false

  slowtree = 0

  count = 0

  insertTick = []

  constructor() {
    super((1 / 6) * 1000)
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
        break
      case this.phys:
        this.phys = new Phys(e.data)
        break
      case this.input:
        this.input = new Input(e.data)
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

  insert(i: number) {
    if (!$inserts[i]) {
      $inserts[i] = new BBox(i)
    }

    this.insertTick.push($inserts[i])
    return this.size.box(i, this.future, $inserts[i])
  }

  tick() {
    if (!this.ready || this.universal.state() !== ERealmState.RUNNING) return
    const isInsert = true
    this.count++
    const t = this.universal.time()

    // rip through matter, update their grid_past/futures

    const moves = new Set<number>()
    const carries = []
    const dx = this.tickrate / 1000

    const gx = this.universal.gravityX(),
      gy = this.universal.gravityY(),
      gz = this.universal.gravityZ()

    for (let i = 0; i < ATOM_COUNT; i++) {
      const phase = this.phys.phase(i)
      const core = this.phys.core(i)
      const carried = this.phys.carried(i)

      switch (phase) {
        case EPhase.VOID:
          continue
        case EPhase.DIVINE:
          moves.add(i)
        case EPhase.STUCK: {
          isInsert && this.insert(i)

          continue
        }
        case EPhase.NORMAL:
        case EPhase.LIQUID: {
          this.insert(i)
        }
      }

      const ci = core !== 0 && i !== core ? core : i

      if (carried !== 0) {
        // set this past and future to the carrier later
        carries.push(i)
        return
      }

      let tx = this.thrust.x(ci),
        ty = this.thrust.y(ci),
        tz = this.thrust.z(ci)

      let vx = this.velocity.x(ci) + tx * dx + gx * dx,
        vy = this.velocity.y(ci) + ty * dx + gy * dx,
        vz = this.velocity.z(ci) + tz * dx + gz * dx

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
            const dx = cMX - cX > 0 ? x - cMX : 0
            this.future.x(i, cX + dx)
            this.past.x(i, cX)
          } else if (x < cX) {
            const dx = cMX - cX > 0 ? x - cX : 0
            this.future.x(i, cMX + dx)
            this.past.x(i, cMX)
          }
        }

        if (cageY) {
          if (y > cMY) {
            const dy = cMY - cY > 0 ? y - cMY : 0

            this.future.y(i, cY + dy)
            this.past.y(i, cY)
          } else if (y < cY) {
            const dy = cMY - cY > 0 ? y - cY : 0

            this.future.y(i, cMY + dy)
            this.past.y(i, cMY)
          }
        }

        if (cageZ) {
          if (z > cMZ) {
            const dz = cMZ - cZ > 0 ? z - cMZ : 0
            this.future.z(i, cZ + dz)
            this.past.z(i, cZ)
          } else if (z < cZ) {
            const dz = cMZ - cZ > 0 ? z - cZ : 0
            this.future.z(i, cMZ + dz)
            this.past.z(i, cMZ)
          }
        }
      }

      if (ci === i) {
        this.velocity.x(i, vx * DECAY)
        this.velocity.y(i, vy * DECAY)
        this.velocity.z(i, vz * DECAY)
      }
    }

    for (let carry of carries) {
      // TODO: Support cores
      this.future.vec3(carry, this.future.vec3(this.phys.carried(carry)))
    }

    isInsert && this.collisions(dx, moves)

    this.post(EMessage.PHYS_TICK)
  }

  collisions(dx: number, moves: Set<number>) {
    // collision phase
    this.tree.load(this.insertTick)

    for (let v of this.insertTick) {
      switch (this.phys.phase(v.i)) {
        case EPhase.STUCK:
          continue
      }

      if (!moves.has(v.i)) continue

      let collision = false

      this.future.vec3(v.i, $vec3)
      this.thrust.vec3(v.i, $vec3t).negate()

      this.velocity.vec3(v.i, $vec3v)
      $vec3v.negate()

      this.size.vec3(v.i, $vec3s)
      const phase = this.phys.phase(v.i)
      // reset impact
      this.impact.impact(v.i, 0, -1)
      const isAvatar = this.universal.avatar() === v.i
      const baseCore = this.phys.core(v.i)
      for (let collide of this.tree.search(v)) {
        // richocet off collides
        if (
          collide.i === v.i ||
          (baseCore !== 0 && baseCore === this.phys.core(collide.i))
        )
          continue

        const cPhase = this.phys.phase(collide.i)

        // dont' collide avatar and divine things
        if (isAvatar && cPhase === EPhase.DIVINE) continue

        // switch based on source phase
        switch (phase) {
          case EPhase.DIVINE: {
            switch (cPhase) {
              // pick up
              case EPhase.LIQUID:
              case EPhase.NORMAL:
              case EPhase.STUCK:
                if (this.input.pinching() || this.input.pinchingRight()) {
                }

                if (!(this.input.grabbing() || this.input.grabbingRight()))
                  continue
                $me.copy(v)
                this.size.box(collide.i, this.future, $other)
                $me.intersect($other)
                $me.min.sub($me.max).multiplyScalar(0.1)

                this.future.addX(collide.i, $me.min.x)
                this.future.addY(collide.i, $me.min.y)
                this.future.addZ(collide.i, $me.min.z)
                break
            }

            // not grabbing don't push it

            break
          }
          case EPhase.NORMAL: {
            // ignore liquid
            if (cPhase === EPhase.LIQUID) continue

            $me.copy(v)
            this.size.box(collide.i, this.future, $other)
            $me.intersect($other)
            $me.min.sub($me.max)
            const t = baseCore !== 0 ? baseCore : v.i
            // this.velocity.addX(
            //   t,
            //   Math.max(-MAX_NORMAL_FORCE, Math.min(MAX_NORMAL_FORCE, -$me.minX))
            // )
            this.velocity.addY(
              t,
              Math.max(-MAX_NORMAL_FORCE, Math.min(MAX_NORMAL_FORCE, -$me.minY))
            )
            // this.velocity.addZ(
            //   t,
            //   Math.max(-MAX_NORMAL_FORCE, Math.min(MAX_NORMAL_FORCE, -$me.minZ))
            // )

            break
          }

          case EPhase.LIQUID:
            {
              collide.getCenter($vec3o).sub($vec3)
              $vec3o
                .negate()
                .multiply(
                  $vec3r.set(
                    5 + Math.random(),
                    5 + Math.random(),
                    5 + Math.random()
                  )
                )
                .multiplyScalar(dx)
                .clampLength(-500, 500)

              $vec3v.add($vec3o)

              if (this.phys.phase(collide.i) === EPhase.LIQUID) {
                const core = this.phys.core(collide.i) || collide.i
                this.velocity.addX(core, $vec3v.x * 0.25)
                this.velocity.addY(core, $vec3v.y * 0.25)
                this.velocity.addZ(core, $vec3v.z * 0.25)
              }
            }
            break
        }
        collision = true
        this.impact.impact(v.i, 0, collide.i)
      }

      if (collision) {
        this.velocity.addX(v.i, $vec3v.x)
        this.velocity.addY(v.i, $vec3v.y)
        this.velocity.addZ(v.i, $vec3v.z)
      }
    }

    this.tree.clear()
    this.insertTick = []
  }
}

new Physics()

const $vec3o = new Vector3()
const $vec3v = new Vector3()
const $vec3s = new Vector3()
const $vec3t = new Vector3()
