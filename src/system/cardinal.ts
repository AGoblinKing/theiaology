import { Animation } from 'src/buffer/animation'
import { Cage } from 'src/buffer/cage'
import { Fate } from 'src/buffer/fate'
import { Impact } from 'src/buffer/impact'
import { Matter } from 'src/buffer/matter'
import { Phys } from 'src/buffer/phys'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Thrust } from 'src/buffer/thrust'
import { EStatus, Traits } from 'src/buffer/traits'
import { ERealmState, Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { Spell } from 'src/cardinal/spell'
import spells from 'src/cardinal/spells'
import { ATOM_COUNT, NORMALIZER } from 'src/config'
import { ShapeMap } from 'src/fate/shape'
import { ALPHABET } from 'src/fate/shape/text'
import { EIdle } from 'src/fate/weave'
import { MagickaVoxel } from 'src/magica'
import { Value } from 'src/value'
import { Color, Euler, Object3D, Vector3 } from 'three'
import { EMessage, FRez, ICardinal } from './enum'
import { System } from './system'

const $hsl = { h: 0, s: 0, l: 0 }
const $col = new Color()
const $col2 = new Color()
const $eule = new Euler()
const $o3d = new Object3D()
const $vec3 = new Vector3()
const $vec3_o = new Vector3()

const voxes = new Value<{ [name: string]: MagickaVoxel }>({})

// Deal out entity IDs, execute timeline events
class Cardinal extends System implements ICardinal {
  _available: number[] = [...new Array(ATOM_COUNT)].map((_, i) => i)

  // entity components
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  thrust: Thrust
  size: Size
  impact: Impact
  animation: Animation
  traits: Traits
  velocity: Velocity
  phys: Phys

  fate: Fate
  universal: Universal
  cage: Cage

  forms: { [def: number]: Spell } = {}

  // do a command at timing
  timing: { [time: number]: number[] } = {}
  ready = false

  lastTime = 0

  constructor() {
    // Music Timing works off seconds
    super(200)
  }

  // receives buffers then IDs to free
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
      case this.animation:
        this.animation = new Animation(e.data)
        break
      case this.impact:
        this.impact = new Impact(e.data)
        break

      case this.traits:
        this.traits = new Traits(e.data)
        break

      case this.fate:
        this.fate = new Fate(e.data)
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
        this.ready = true
        break

      // expecting IMessage but no atomics
      default:
        switch (typeof e.data) {
          case 'object':
            // this is voxes data
            voxes.set(e.data)

            // update the timeline
            this.fateUpdated()
            return

          case 'number':
            switch (e.data) {
              case EMessage.REZ:
                this.post(this.reserve())
                break

              case EMessage.FREE_ALL:
                this.freeAll()
                break

              case EMessage.FATE_UPDATE:
                this.fateUpdated()

                break
            }
            return
        }
    }
  }

  doTurn(sec?: number) {
    if (sec === undefined) sec = this.universal.musicTime()
    if (!this.timing[sec]) return

    const toRez = []

    for (let i of this.timing[sec]) {
      const def = this.fate.who(i)
      const $spell = this.forms[def]

      if (!$spell) continue

      // Check the timing to only apply the right stuff
      if (this.fate.when(i) > sec) continue

      const s = this.fate.spell(i)
      if (spells[s]) {
        const r = spells[s](i, this, $spell, sec)
        if (typeof r === 'number') {
          toRez.push(r)
        }
      }
    }

    for (let rez of toRez) {
      for (let c = 0; c < this.fate.data0(rez); c++) {
        this.entity(this.fate.who(rez))
      }
    }

    // clean up from turn
    for (let def of Object.values(this.forms)) {
      def.dirty.clear()
    }

    this.post(EMessage.CARDINAL_TICK)
  }

  // Entity ID number to init
  entity(def: number) {
    // navigate up the tree to root
    // build for loops to apply

    const t = this.universal.time()
    const $spell = this.forms[def]

    // now we rez
    // determine voxel count, for loop over them
    const shape = ShapeMap[$spell.flock.shape]
    if (!shape) {
      throw new Error("couldn't find shape on shapemap" + $spell.flock.shape)
    }

    const atoms = shape.AtomCount(
      $spell.flock.size,
      $spell.flock.step,
      $spell.flock.size2
    )
    for (let i = 0; i < atoms; i++) {
      const $shape = shape(
        i,
        $spell.flock.size,
        $spell.flock.step,
        $spell.flock.size2
      )

      // apply $rez data

      const x =
        $spell.pos.x +
        $shape.x +
        Math.round($spell.posvar.x * Math.random() * 2 - $spell.posvar.x)
      const y =
        $spell.pos.y +
        $shape.y +
        Math.round($spell.posvar.y * Math.random() * 2 - $spell.posvar.y)

      const z =
        $spell.pos.z +
        $shape.z +
        Math.round($spell.posvar.z * Math.random() * 2 - $spell.posvar.z)

      $col
        .setRGB(Math.random(), Math.random(), Math.random())
        .lerp($spell.color, (NORMALIZER - $spell.col.variance) / NORMALIZER)

      // tilt
      $col.getHSL($hsl)

      $col.setHSL($hsl.h + $spell.col.tilt / NORMALIZER, $hsl.s, $hsl.l)

      const sx = $spell.size.x + Math.round(Math.random() * $spell.sizevar.x)
      const sy = $spell.size.y + Math.round(Math.random() * $spell.sizevar.y)
      const sz = $spell.size.z + Math.round(Math.random() * $spell.sizevar.z)

      switch (true) {
        // gate
        case $spell.gate !== undefined:
          // swirl some voxels and add to gate list
          // physics system will check to see if they are in the gate
          continue
        // land
        case $spell.land !== undefined:
          this.post({
            message: EMessage.LAND_ADD,
            x,
            y,
            z,
            id: $spell.id,
            ruler: $spell.ruler,
            land: $spell.land,
            cage: $spell.cage,
            shape: $spell.size,
          })

          $spell.lands++
          continue
        // is voxel rez
        case $spell.vox !== '' && voxes.$[$spell.vox] !== undefined:
          // Need to clean this part up
          this.vox($spell, $hsl, t, x, y, z, sx, sy, sz)
          continue
        // is text rez
        case $spell.text !== undefined:
          this.text($spell, $hsl, t, x, y, z, sx, sy, sz, $col)
          continue
        default:
          this.basic($spell, $hsl, t, x, y, z, sx, sy, sz)
      }
    }
  }

  text($spell: Spell, $hsl, t, x, y, z, sx, sy, sz, color) {
    for (let i = 0; i < $spell.text.length; i++) {
      const map = ALPHABET[$spell.text.charAt(i).toLowerCase()]
      if (!map) continue

      for (let v of map) {
        const id = this.reserve()
        $spell.atoms.push(id)

        if (v[2] === undefined) {
          v[2] = v[0]
        }
        if (v[3] === undefined) {
          v[3] = v[1]
        }
        const smx = v[2] - v[0]
        const smy = v[3] - v[1]

        this.future.time(id, t + 1000 * Math.random() + 500)
        this.future.x(id, x + v[0] * sx + (sx * smx) / 2)
        this.future.y(id, y + v[1] * sy + (sy * smy) / 2)
        this.future.z(id, z)

        this.size.x(id, sx + sx * smx)
        this.size.y(id, sy + sy * smy)
        this.size.z(id, sz + Math.random() * 0.5)
        color
          .setRGB(Math.random(), Math.random(), Math.random())
          .lerp($spell.color, (NORMALIZER - $spell.col.variance) / NORMALIZER)

        this.thrust.x(id, $spell.vel.x)
        this.thrust.y(id, $spell.vel.y)
        this.thrust.z(id, $spell.vel.z)

        this.velocity.x(id, $spell.vel.x)
        this.velocity.y(id, $spell.vel.y)
        this.velocity.z(id, $spell.vel.z)

        this.shared(id, color, $spell)
      }

      x += sx * 5
    }
  }

  basic($spell: Spell, $hsl, t, x, y, z, sx, sy, sz) {
    const id = this.reserve()
    $spell.atoms.push(id)

    this.future.time(id, t + 1000 * Math.random() + 500)
    this.future.x(id, x)
    this.future.y(id, y)
    this.future.z(id, z)

    this.size.x(id, sx)
    this.size.y(id, sy)
    this.size.z(id, sz)
    this.thrust.x(
      id,
      $spell.vel.x +
        Math.floor(
          Math.random() * $spell.velvar.x -
            $spell.velvar.x / 2 +
            ($spell.velvarconstraint.x * $spell.velvar.x) / 2
        )
    )
    this.thrust.y(
      id,
      $spell.vel.y +
        Math.floor(
          Math.random() * $spell.velvar.y -
            $spell.velvar.y / 2 +
            ($spell.velvarconstraint.y * $spell.velvar.y) / 2
        )
    )
    this.thrust.z(
      id,
      $spell.vel.z +
        Math.floor(
          Math.random() * $spell.velvar.z -
            $spell.velvar.z / 2 +
            ($spell.velvarconstraint.y * $spell.velvar.y) / 2
        )
    )

    this.velocity.x(id, this.thrust.x(id))
    this.velocity.y(id, this.thrust.y(id))
    this.velocity.z(id, this.thrust.z(id))

    this.shared(id, $col, $spell)
  }

  vox($spell: Spell, $hsl, t, x, y, z, sx, sy, sz) {
    // vox miss, but could be because we haven't loaded $voxes yet
    const voxDef = voxes.$[$spell.vox]
    const ts = $hsl.s
    const tl = $hsl.l

    const variance = ($spell.col.variance / NORMALIZER) * Math.random()
    let rx = ($spell.rotvar.x / NORMALIZER) * Math.random() * Math.PI * 2
    let ry = ($spell.rotvar.y / NORMALIZER) * Math.random() * Math.PI * 2
    let rz = ($spell.rotvar.z / NORMALIZER) * Math.random() * Math.PI * 2

    if ($spell.doLook) {
      $o3d.position.set(x, $spell.look.y, z)
      $o3d.lookAt($spell.look)
      $eule.setFromQuaternion($o3d.quaternion)

      $eule.y += ($spell.rot.y / NORMALIZER) * Math.PI * 2
      $eule.z += ($spell.rot.z / NORMALIZER) * Math.PI * 2
      $eule.x += ($spell.rot.x / NORMALIZER) * Math.PI * 2
    } else {
      $eule.set(
        rx + ($spell.rot.x / NORMALIZER) * Math.PI * 2,
        ry + ($spell.rot.y / NORMALIZER) * Math.PI * 2,
        rz + ($spell.rot.z / NORMALIZER) * Math.PI * 2
      )
    }
    const rtx =
      Math.random() * $spell.velvar.x -
      $spell.velvar.x / 2 +
      ($spell.velvarconstraint.x * $spell.velvar.x) / 2
    const rty =
      Math.random() * $spell.velvar.y -
      $spell.velvar.y / 2 +
      ($spell.velvarconstraint.y * $spell.velvar.y) / 2
    const rtz =
      Math.random() * $spell.velvar.z -
      $spell.velvar.z / 2 +
      ($spell.velvarconstraint.z * $spell.velvar.z) / 2

    let core

    for (let i = 0; i < voxDef.xyzi.length / 4; i++) {
      const id = this.reserve()
      if (core === undefined) core = id
      $spell.atoms.push(id)
      const ix = i * 4

      $vec3
        .set(
          voxDef.xyzi[ix] * sx,
          voxDef.xyzi[ix + 2] * sy,
          voxDef.xyzi[ix + 1] * sz
        )

        .applyEuler($eule)
        .add($vec3_o.set(x, y, z))

      this.future.time(id, t + 1000 * Math.random() + 500)
      this.future.x(id, $vec3.x + Math.round(Math.random() * 2 - 1))
      this.future.y(id, $vec3.y + Math.round(Math.random() * 2 - 1))
      this.future.z(id, $vec3.z + Math.round(Math.random() * 2 - 1))

      // -1 because magica?
      const c = (voxDef.xyzi[ix + 3] - 1) * 4

      const r = voxDef.rgba[c]
      const g = voxDef.rgba[c + 1]
      const b = voxDef.rgba[c + 2]
      $col2.setRGB(r / 255, g / 255, b / 255).getHSL($hsl)

      let addTilt = 0
      if ($spell.voxvar.x === r * 256 * 256 + g * 256 + b) {
        addTilt = Math.random() * $spell.voxvar.z + $spell.voxvar.y
      }

      $col2.setHSL(
        ($hsl.h +
          $spell.col.tilt / NORMALIZER +
          addTilt +
          variance +
          Math.random() * 0.05) %
          1,
        ($hsl.s + ts) / 2,
        ($hsl.l + tl) / 2
      )

      this.size.x(id, sx)
      this.size.y(id, sy)
      this.size.z(id, sz)

      if (id === core) {
        this.thrust.x(id, $spell.vel.x + rtx)
        this.thrust.y(id, $spell.vel.y + rty)
        this.thrust.z(id, $spell.vel.z + rtz)
        this.velocity.x(id, this.thrust.x(id))
        this.velocity.y(id, this.thrust.y(id))
        this.velocity.z(id, this.thrust.z(id))
      }

      // set the group so they behave the same way
      this.phys.core(id, core)

      this.shared(id, $col2, $spell)
    }
  }

  shared(id: number, color: Color, $spell: Spell) {
    this.matter.red(id, Math.floor(color.r * NORMALIZER))
    this.matter.green(id, Math.floor(color.g * NORMALIZER))
    this.matter.blue(id, Math.floor(color.b * NORMALIZER))

    this.phys.phase(id, $spell.phase)
    this.impact.reaction(id, $spell.impact)
    this.cage.box(id, $spell.cage)
    this.traits.role(id, $spell.role)

    // TODO: handle voxes better
    if ($spell.avatar) {
      this.universal.avatar(id)
      this.universal.thrustStrength($spell.avatarThrust)
      this.post(EMessage.CARDINAL_AVATAR)
    }
  }

  process() {
    const timing = this.universal.musicTime()
    this.lastTime = timing
    // run through timeline and execute rezes
    for (let i = 0; i < this.fate.length / Fate.COUNT; i++) {
      const t = this.fate.when(i)
      this.timing[t] = this.timing[t] || []
      this.timing[t].push(i)

      const def = this.fate.who(i)

      if (!this.forms[def]) {
        this.forms[def] = new Spell(def)
        const parent = this.fate.who(def)

        // avoid loop 0 => 0
        if (parent !== def) {
          const p = (this.forms[parent] =
            this.forms[parent] || new Spell(parent))
          p._.push(this.forms[def])
        }
      }
    }

    let t = 0
    while (t <= timing) {
      this.doTurn(t++)
    }
  }

  fateUpdated() {
    this.freeAll()
    // clear it
    this.timing = {}
    this.forms = {}

    this.post(EMessage.CLEAR_COLOR_UPDATE)

    this.process()

    this.post(EMessage.FATE_UPDATE)
  }

  freeAll() {
    for (let i = 0; i < ATOM_COUNT; i++) {
      this.free(i)
    }
    this._available = [...new Array(ATOM_COUNT)].map((_, i) => i)
  }

  free(i: number) {
    this.animation.free(i, Animation.COUNT)
    this.future.free(i, SpaceTime.COUNT)
    this.past.free(i, SpaceTime.COUNT)
    this.thrust.free(i, Thrust.COUNT)
    this.matter.free(i, Matter.COUNT)
    this.impact.free(i, Impact.COUNT)
    this.size.free(i, Thrust.COUNT)
    this.cage.free(i, Cage.COUNT)
    this.velocity.free(i, Velocity.COUNT)
    this.traits.free(i, Traits.COUNT)
    this.phys.free(i, Phys.COUNT)
  }

  available(i: number) {
    this.free(i)
    this._available.push(i)
  }

  reserve: FRez = () => {
    const i = this._available.pop()
    this.free(i)

    this.traits.status(i, EStatus.Assigned)
    return i
  }

  tick() {
    if (!this.ready || this.universal.state() !== ERealmState.RUNNING) return

    const t = this.universal.musicTime()
    if (t > this.lastTime) {
      let lt = this.lastTime
      while (lt < t) {
        lt++
        this.doTurn(lt)
      }

      this.lastTime = t

      // back in time
    } else if (t < this.lastTime) {
      this.fateUpdated()
    }

    switch (this.universal.idle()) {
      case EIdle.RANDOMIZE:
        this.randomize()
        break
    }
  }

  randomize() {
    // TODO: Use cage bounds
    const scale = 100000
    const t = this.universal.time()

    const chunk = 1000
    // lets prove out thhese even render
    for (let ix = last; ix < last + chunk; ix++) {
      // only use left overs
      const i = this._available[ix % this._available.length]
      this.past.x(i, this.future.x(i))
      this.past.y(i, this.future.y(i))
      this.past.z(i, this.future.z(i))
      this.past.time(i, t)

      this.future.x(i, Math.floor(Math.random() * scale - scale / 2))
      this.future.y(i, Math.floor(Math.random() * scale - scale / 2))
      this.future.z(i, Math.floor(Math.random() * scale - scale / 2))
      this.future.time(i, t + 30000 + 100)

      const s = 20 + Math.floor(Math.random() * 5)

      this.size.x(i, s)
      this.size.y(i, s)
      this.size.z(i, s)

      this.matter.blue(i, NORMALIZER)
      this.matter.red(i, Math.floor(Math.random() * NORMALIZER))
      this.matter.green(i, Math.floor(Math.random() * NORMALIZER))
    }

    last += chunk
  }
}

let last = 0

new Cardinal()
