import { EAnimation } from 'src/buffer/animation'
import { EPhase } from 'src/buffer/phys'
import { ERole } from 'src/buffer/traits'
import { NORMALIZER } from 'src/config'
import { ALPHABET } from 'src/fate/shape/text'
import { EImpactReaction, EShape } from 'src/fate/weave'
import { EMessage, ICardinal } from 'src/system/enum'
import { Box3, Color, Euler, Object3D, Vector3 } from 'three'
const $hsl = { h: 0, s: 0, l: 0 }
const $col = new Color()
const $col2 = new Color()
const $eule = new Euler()
const $o3d = new Object3D()
const $vec3 = new Vector3()
const $vec3_o = new Vector3()

export enum ERipple {
  PHASE,
  IMPACT,
  VOX,
  LOOK,
  DOLOOK,
  TEXT,
  COL,
  FLOCK,
  POSVAR,
  SIZEVAR,
  VOXVAR,
  COLOR,
  VEL,
  VELVAR,
  SIZE,
  POS,
  ROT,
  ROTVAR,
  POSADD,
  VELADD,
  CAGE,
  REZFREE,
  RULER,
  LAND,
  VELVARCONSTRAINT,
  AI,
  EFFECT,
}

export class Spell {
  role: ERole = ERole.NONE
  color = new Color()
  pos = new Vector3()
  rot = new Euler()
  rotvar = new Euler()
  size = new Vector3()
  col = { tilt: 0, variance: 0 }
  vox = ''
  voxvar = new Vector3()
  voxbroken = false
  sizevar = new Vector3()
  posvar = new Vector3()
  flock: { shape: EShape; size: number; step: number; size2: number }
  look = new Vector3()
  impact = EImpactReaction.NONE
  phase = EPhase.VOID
  vel = new Vector3()
  velvar = new Vector3()
  velvarconstraint = new Vector3()

  text: string
  cage = new Box3()

  doLook = false
  gate: string
  land: string
  ruler: string
  // do not reset to let rezes linger
  atoms: number[] = []
  lands: number = 0

  midi = { instrument: 0x90, volume: 1, pan: 0.5 }
  noise = 0

  // subdefines
  _: Spell[] = []
  dirty: Set<ERipple> = new Set()
  id: number
  avatar = false
  avatarThrust = 1.0
  effect = EAnimation.NORMAL
  doRipple = true
  doLive = true

  cardinal: ICardinal

  constructor(id, cardinal: ICardinal) {
    this.cardinal = cardinal
    this.id = id
    this.Reset()
  }

  live(): number[] {
    if (!this.doLive) return
    return [...this.atoms, ...this._.reduce((a, b) => [...a, ...b.live()], [])]
  }

  Reset() {
    this.phase = EPhase.GHOST
    this.impact = EImpactReaction.NONE
    this.vel.set(0, 0, 0)
    this.velvar.set(0, 0, 0)
    this.color.setRGB(1, 1, 1)
    this.pos.set(0, 0, 0)
    this.rot.set(0, 0, 0)
    this.rotvar.set(0, 0, 0)
    this.voxvar.set(0, 0, 0)
    this.size.set(1, 1, 1)
    this.vox = ''
    this.col.tilt = 0
    this.col.variance = 0

    this.sizevar.set(0, 0, 0)
    this.look.set(0, 0, 0)

    this.posvar.set(0, 0, 0)
    this.flock = { shape: EShape.PLANE, size: 1, step: 0, size2: 1 }
    this.doLook = false
    this.text = undefined
    this.atoms = []
    this._ = []
    this.dirty.clear()
    this.lands = 0
    this.velvarconstraint.set(0, 0, 0)
    this.midi.instrument = 0x90
    this.midi.volume = 1
    this.midi.pan = 0.5
    this.voxbroken = false
    this.effect = EAnimation.NORMAL
    this.doRipple = true
    this.doLive = true
    this.noise = 0
    this.midi.instrument = 0x90
    this.midi.volume = 1
    this.midi.pan = 0.5
    this.avatar = false
    this.avatarThrust = 1

    delete this.gate
    delete this.land
    delete this.ruler
  }

  Rerez() {
    // rip through all the atoms and update them according to their core
    const cores = {}
    for (const atom of this.atoms) {
      const core = this.cardinal.phys.core(atom)
      if (core !== atom) {
        cores[core] === undefined && (cores[core] = 0)
      }
    }
  }

  Text(x, y, z, sx, sy, sz, t = this.cardinal.universal.time()) {
    for (let i = 0; i < this.text.length; i++) {
      const map = ALPHABET[this.text.charAt(i).toLowerCase()]
      if (!map) continue

      for (let v of map) {
        const id = this.cardinal.reserve()
        this.atoms.push(id)

        if (v[2] === undefined) {
          v[2] = v[0]
        }
        if (v[3] === undefined) {
          v[3] = v[1]
        }
        const smx = v[2] - v[0]
        const smy = v[3] - v[1]

        this.cardinal.future.time(id, t + 1000 * Math.random() + 500)
        this.cardinal.future.x(id, x + v[0] * sx + (sx * smx) / 2)
        this.cardinal.future.y(id, y + v[1] * sy + (sy * smy) / 2)
        this.cardinal.future.z(id, z)

        this.cardinal.size.x(id, sx + sx * smx)
        this.cardinal.size.y(id, sy + sy * smy)
        this.cardinal.size.z(id, sz + Math.random() * 0.5)

        $col
          .setRGB(Math.random(), Math.random(), Math.random())
          .lerp(this.color, (NORMALIZER - this.col.variance) / NORMALIZER)

        this.cardinal.thrust.x(id, this.vel.x)
        this.cardinal.thrust.y(id, this.vel.y)
        this.cardinal.thrust.z(id, this.vel.z)

        this.cardinal.velocity.x(id, this.vel.x)
        this.cardinal.velocity.y(id, this.vel.y)
        this.cardinal.velocity.z(id, this.vel.z)

        this.Shared(id, $col)
      }

      x += sx * 5
    }
  }

  Basic(x, y, z, sx, sy, sz, t = this.cardinal.universal.time()) {
    $col
      .setRGB(Math.random(), Math.random(), Math.random())
      .lerp(this.color, (NORMALIZER - this.col.variance) / NORMALIZER)

    // tilt
    $col.getHSL($hsl)

    $col.setHSL($hsl.h + this.col.tilt / NORMALIZER, $hsl.s, $hsl.l)

    const id = this.cardinal.reserve()

    this.atoms.push(id)

    this.cardinal.future.time(id, t + 1000 * Math.random() + 500)
    this.cardinal.future.x(id, x)
    this.cardinal.future.y(id, y)
    this.cardinal.future.z(id, z)

    this.cardinal.size.x(id, sx)
    this.cardinal.size.y(id, sy)
    this.cardinal.size.z(id, sz)
    this.cardinal.thrust.x(
      id,
      this.vel.x +
        Math.floor(
          Math.random() * this.velvar.x -
            this.velvar.x / 2 +
            (this.velvarconstraint.x * this.velvar.x) / 2
        )
    )
    this.cardinal.thrust.y(
      id,
      this.vel.y +
        Math.floor(
          Math.random() * this.velvar.y -
            this.velvar.y / 2 +
            (this.velvarconstraint.y * this.velvar.y) / 2
        )
    )
    this.cardinal.thrust.z(
      id,
      this.vel.z +
        Math.floor(
          Math.random() * this.velvar.z -
            this.velvar.z / 2 +
            (this.velvarconstraint.y * this.velvar.y) / 2
        )
    )

    this.cardinal.velocity.x(id, this.cardinal.thrust.x(id))
    this.cardinal.velocity.y(id, this.cardinal.thrust.y(id))
    this.cardinal.velocity.z(id, this.cardinal.thrust.z(id))

    this.Shared(id, $col)
  }

  Vox(x, y, z, sx, sy, sz, t = this.cardinal.universal.time()) {
    $col
      .setRGB(Math.random(), Math.random(), Math.random())
      .lerp(this.color, (NORMALIZER - this.col.variance) / NORMALIZER)

    // tilt
    $col.getHSL($hsl)

    $col.setHSL($hsl.h + this.col.tilt / NORMALIZER, $hsl.s, $hsl.l)
    // vox miss, but could be because we haven't loaded $voxes yet
    const voxDef = this.cardinal.voxes.$[this.vox]
    const ts = $hsl.s
    const tl = $hsl.l

    const variance = (this.col.variance / NORMALIZER) * Math.random()
    let rx = (this.rotvar.x / NORMALIZER) * Math.random() * Math.PI * 2
    let ry = (this.rotvar.y / NORMALIZER) * Math.random() * Math.PI * 2
    let rz = (this.rotvar.z / NORMALIZER) * Math.random() * Math.PI * 2

    if (this.doLook) {
      $o3d.position.set(x, this.look.y, z)
      $o3d.lookAt(this.look)
      $eule.setFromQuaternion($o3d.quaternion)

      $eule.y += (this.rot.y / NORMALIZER) * Math.PI * 2
      $eule.z += (this.rot.z / NORMALIZER) * Math.PI * 2
      $eule.x += (this.rot.x / NORMALIZER) * Math.PI * 2
    } else {
      $eule.set(
        rx + (this.rot.x / NORMALIZER) * Math.PI * 2,
        ry + (this.rot.y / NORMALIZER) * Math.PI * 2,
        rz + (this.rot.z / NORMALIZER) * Math.PI * 2
      )
    }
    const rtx =
      Math.random() * this.velvar.x -
      this.velvar.x / 2 +
      (this.velvarconstraint.x * this.velvar.x) / 2
    const rty =
      Math.random() * this.velvar.y -
      this.velvar.y / 2 +
      (this.velvarconstraint.y * this.velvar.y) / 2
    const rtz =
      Math.random() * this.velvar.z -
      this.velvar.z / 2 +
      (this.velvarconstraint.z * this.velvar.z) / 2

    let core

    for (let i = 0; i < voxDef.xyzi.length / 4; i++) {
      const id = this.cardinal.reserve()
      if (core === undefined || this.voxbroken) {
        core = id
      }
      this.atoms.push(id)
      const ix = i * 4

      $vec3
        .set(
          voxDef.xyzi[ix] * sx,
          voxDef.xyzi[ix + 2] * sy,
          voxDef.xyzi[ix + 1] * sz
        )

        .applyEuler($eule)
        .add($vec3_o.set(x, y, z))

      this.cardinal.future.time(id, t + 1000 * Math.random() + 500)
      this.cardinal.future.x(id, $vec3.x + Math.round(Math.random() * 2 - 1))
      this.cardinal.future.y(id, $vec3.y + Math.round(Math.random() * 2 - 1))
      this.cardinal.future.z(id, $vec3.z + Math.round(Math.random() * 2 - 1))

      // -1 because magica?
      const c = (voxDef.xyzi[ix + 3] - 1) * 4

      const r = voxDef.rgba[c]
      const g = voxDef.rgba[c + 1]
      const b = voxDef.rgba[c + 2]
      $col2.setRGB(r / 255, g / 255, b / 255).getHSL($hsl)

      let addTilt = 0
      if (this.voxvar.x === r * 256 * 256 + g * 256 + b) {
        addTilt = Math.random() * this.voxvar.z + this.voxvar.y
      }

      $col2.setHSL(
        ($hsl.h +
          this.col.tilt / NORMALIZER +
          addTilt +
          variance +
          Math.random() * 0.05) %
          1,
        ($hsl.s + ts) / 2,
        ($hsl.l + tl) / 2
      )

      this.cardinal.size.x(id, sx)
      this.cardinal.size.y(id, sy)
      this.cardinal.size.z(id, sz)

      if (id === core) {
        this.cardinal.thrust.x(id, this.vel.x + rtx)
        this.cardinal.thrust.y(id, this.vel.y + rty)
        this.cardinal.thrust.z(id, this.vel.z + rtz)
        this.cardinal.velocity.x(id, this.cardinal.thrust.x(id))
        this.cardinal.velocity.y(id, this.cardinal.thrust.y(id))
        this.cardinal.velocity.z(id, this.cardinal.thrust.z(id))
      }

      // set the group so they behave the same way
      this.cardinal.phys.core(id, core)

      this.Shared(id, $col2)
    }
  }

  Shared(id: number, color: Color) {
    this.cardinal.matter.red(id, Math.floor(color.r * NORMALIZER))
    this.cardinal.matter.green(id, Math.floor(color.g * NORMALIZER))
    this.cardinal.matter.blue(id, Math.floor(color.b * NORMALIZER))

    this.cardinal.phys.phase(id, this.phase)
    this.cardinal.impact.reaction(id, this.impact)
    this.cardinal.cage.box(id, this.cage)
    this.cardinal.traits.role(id, this.role)

    this.cardinal.animation.animation(id, this.effect)
    this.noise !== 0 && this.cardinal.noise.noise(id, this.noise)

    // TODO: handle voxes betterps
    if (this.avatar) {
      this.cardinal.universal.avatar(id)
      this.cardinal.universal.thrustStrength(this.avatarThrust)
      this.cardinal.post(EMessage.CARD_AVATAR)
    }
  }

  Ripple(what: ERipple, data: any, mark = true) {
    if (!this.doRipple) return

    if (mark) this.dirty.add(what)

    for (let c of this._) {
      if (c.dirty.has(what)) continue
      c.Ripple(what, data, false)

      switch (what) {
        case ERipple.PHASE:
          c.phase = data

          break
        case ERipple.IMPACT:
          c.impact = data
          break
        case ERipple.VOX:
          c.vox = data
          break
        case ERipple.TEXT:
          c.text = data
          break
        case ERipple.DOLOOK:
          c.doLook = data
          break
        case ERipple.VEL:
          c.vel.copy(data)
          break
        case ERipple.VELVAR:
          c.velvar.copy(data)
          break
        case ERipple.VELVARCONSTRAINT:
          c.velvarconstraint.copy(data)
          break
        case ERipple.POS:
          c.pos.copy(data)
          break
        case ERipple.POSVAR:
          c.posvar.copy(data)
          break

        case ERipple.VOXVAR:
          c.voxvar.copy(data)
          break
        case ERipple.COL:
          c.col.tilt = data.tilt
          c.col.variance = data.variance
          break
        case ERipple.FLOCK:
          c.flock.shape = data.shape
          c.flock.size = data.size
          c.flock.step = data.step
          c.flock.size2 = data.size2
          break

        case ERipple.SIZE:
          c.size.copy(data)
          break

        case ERipple.SIZEVAR:
          c.sizevar.copy(data)
          break

        case ERipple.ROT:
          c.rot.copy(data)
          break

        case ERipple.ROTVAR:
          c.rotvar.copy(data)
          break
        case ERipple.COLOR:
          c.color.copy(data)
          break
        case ERipple.CAGE:
          c.cage.copy(data)
          break
        case ERipple.POSADD:
          c.pos.add(data)
          break
        case ERipple.VELADD:
          c.vel.add(data)
          break
        case ERipple.REZFREE:
          for (let atom of this.atoms) {
            data.free(atom)
          }
          this.atoms = []
          break
        case ERipple.RULER:
          c.ruler = data
          break
        case ERipple.LAND:
          c.land = data
          break
        case ERipple.EFFECT:
          c.effect = data
          break
      }
    }
  }
}
