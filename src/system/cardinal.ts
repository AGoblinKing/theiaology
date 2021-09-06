import { Animation } from 'src/buffer/animation'
import { Cage } from 'src/buffer/cage'
import { Impact } from 'src/buffer/impact'
import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { EStatus, Status } from 'src/buffer/status'
import { Timeline } from 'src/buffer/timeline'
import { ERealmState, Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ENTITY_COUNT, NORMALIZER } from 'src/config'
import { MagickaVoxel } from 'src/render/magica'
import { ShapeMap } from 'src/shape'
import { ALPHABET } from 'src/shape/text'
import { EAxis, EIdle, EShape, ESpell } from 'src/timeline/def-timeline'
import { ERipple, Spell } from 'src/timeline/spell'
import { Value } from 'src/value/value'
import { Color, Euler, Object3D, Vector3 } from 'three'
import { EMessage, FRez } from './sys-enum'
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
class Cardinal extends System {
  _available: number[] = [...new Array(ENTITY_COUNT)].map((_, i) => i)

  // entity components
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Velocity
  size: Size
  impact: Impact
  animation: Animation
  status: Status

  timeline: Timeline
  universal: Universal
  cage: Cage

  forms: { [def: number]: Spell } = {}

  // do a command at timing
  timing: { [time: number]: number[] } = {}
  ready = false

  lastTime = 0

  constructor() {
    // Music Timing works off seconds
    super(500)
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
      case this.velocity:
        this.velocity = new Velocity(e.data)
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

      case this.status:
        this.status = new Status(e.data)
        break

      case this.timeline:
        this.timeline = new Timeline(e.data)
        break

      case this.universal:
        this.universal = new Universal(e.data)
        break

      case this.cage:
        this.cage = new Cage(e.data)
        this.ready = true
        break

      // expecting IMessage but no atomics
      default:
        switch (typeof e.data) {
          case 'object':
            // this is voxes data
            voxes.set(e.data)

            // update the timeline
            this.timelineUpdated()
            return

          case 'number':
            switch (e.data) {
              case EMessage.REZ:
                this.post(this.reserve())
                break

              case EMessage.FREE_ALL:
                this.freeAll()
                break

              case EMessage.TIMELINE_UPDATE:
                this.timelineUpdated()

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
      const def = this.timeline.who(i)
      const $spell = this.forms[def]

      if (!$spell) continue

      // Check the timing to only apply the right stuff
      if (this.timeline.when(i) > sec) continue

      switch (this.timeline.invoke(i)) {
        case ESpell.POS_ADD:
          $spell.pos.add(
            $vec3.set(
              this.timeline.data0(i),
              this.timeline.data1(i),
              this.timeline.data2(i)
            )
          )

          $spell.ripple(ERipple.POSADD, $vec3)

          for (let atom of $spell.all()) {
            this.future.addX(atom, $vec3.x)
            this.future.addY(atom, $vec3.y)
            this.future.addZ(atom, $vec3.z)
            this.future.time(sec)
          }

          break
        case ESpell.THRUST_ADD:
          $spell.vel.add(
            $vec3.set(
              this.timeline.data0(i),
              this.timeline.data1(i),
              this.timeline.data2(i)
            )
          )

          $spell.ripple(ERipple.VELADD, $vec3)

          for (let atom of $spell.all()) {
            this.velocity.addX(atom, $vec3.x)
            this.velocity.addY(atom, $vec3.y)
            this.velocity.addZ(atom, $vec3.z)
          }
          break
        case ESpell.FLOCK_TEXT:
          $spell.text = this.timeline.text(i)
          $spell.ripple(ERipple.TEXT, $spell.text)
          break
        case ESpell.SHAPE_VAR:
          $spell.sizevar.set(
            this.timeline.data0(i),
            this.timeline.data1(i),
            this.timeline.data2(i)
          )
          $spell.ripple(ERipple.SIZEVAR, $spell.sizevar)
          break
        case ESpell.ROT_VAR:
          $spell.rotvar.set(
            this.timeline.data0(i),
            this.timeline.data1(i),
            this.timeline.data2(i)
          )
          $spell.ripple(ERipple.ROTVAR, $spell.rotvar)
          break
        case ESpell.ROT:
          $spell.rot.set(
            this.timeline.data0(i),
            this.timeline.data1(i),
            this.timeline.data2(i)
          )
          $spell.ripple(ERipple.ROT, $spell.rot)
          break
        case ESpell.ROT_LOOK:
          $spell.doLook = true
          $spell.look.set(
            this.timeline.data0(i),
            this.timeline.data1(i),
            this.timeline.data2(i)
          )
          $spell.ripple(ERipple.DOLOOK, $spell.doLook)
          $spell.ripple(ERipple.LOOK, $spell.look)
          break
        case ESpell.SHAPE_VOX_VAR:
          $spell.voxvar.set(
            this.timeline.data0(i),
            this.timeline.data1(i),
            this.timeline.data2(i)
          )

          $spell.ripple(ERipple.VOXVAR, $spell.voxvar)
          break
        case ESpell.SHAPE_VOX:
          $spell.vox = this.timeline.text(i)
          $spell.ripple(ERipple.VOX, $spell.vox)
          break
        case ESpell.FLOCK:
          $spell.flock.shape = this.timeline.data0(i)
          $spell.flock.size = this.timeline.data1(i)
          $spell.flock.step = this.timeline.data2(i)
          $spell.ripple(ERipple.FLOCK, $spell.flock)
          break
        case ESpell.FLOCK_RING:
          $spell.flock.shape = EShape.Ring
          $spell.flock.size = this.timeline.data0(i)
          $spell.flock.step = this.timeline.data1(i)
          $spell.ripple(ERipple.FLOCK, $spell.flock)
          break
        case ESpell.FLOCK_GRID:
          $spell.flock.shape = EShape.Plane
          $spell.flock.size = this.timeline.data0(i)
          $spell.flock.step = this.timeline.data1(i)
          $spell.ripple(ERipple.FLOCK, $spell.flock)
          break
        case ESpell.SHAPE:
          $spell.size.x = this.timeline.data0(i)
          $spell.size.y = this.timeline.data1(i)
          $spell.size.z = this.timeline.data2(i)
          $spell.ripple(ERipple.SIZE, $spell.size)
          break
        case ESpell.SHAPE_COLOR:
          const rgb = this.timeline.data0(i)
          $spell.color.setHex(rgb)
          $spell.col.tilt = this.timeline.data1(i)
          $spell.col.variance = this.timeline.data2(i)
          $spell.ripple(ERipple.COL, $spell.col)
          $spell.ripple(ERipple.COLOR, $spell.color)
          break
        case ESpell.POS_VAR:
          $spell.posvar.x = this.timeline.data0(i)
          $spell.posvar.y = this.timeline.data1(i)
          $spell.posvar.z = this.timeline.data2(i)
          $spell.ripple(ERipple.POSVAR, $spell.posvar)
          break
        case ESpell.POS:
          $spell.pos.x = this.timeline.data0(i)
          $spell.pos.y = this.timeline.data1(i)
          $spell.pos.z = this.timeline.data2(i)

          for (let atom of $spell.all()) {
            this.future.x(atom, $spell.pos.x)
            this.future.y(atom, $spell.pos.y)
            this.future.z(atom, $spell.pos.z)
            this.future.time(atom, sec)
          }

          $spell.ripple(ERipple.POS, $spell.pos)
          break
        case ESpell.THRUST:
          $spell.vel.set(
            this.timeline.data0(i),
            this.timeline.data1(i),
            this.timeline.data2(i)
          )

          for (let atom of $spell.all()) {
            this.velocity.x(atom, $spell.vel.x)
            this.velocity.y(atom, $spell.vel.y)
            this.velocity.z(atom, $spell.vel.z)
          }

          $spell.ripple(ERipple.VEL, $spell.vel)
          break
        case ESpell.THRUST_VAR:
          const amount = this.timeline.data1(i)
          const constraint = this.timeline.data2(i)

          switch (this.timeline.data0(i)) {
            case EAxis.XYZ:
              $spell.velvar.z += amount
              $spell.velvarconstraint.z = constraint
            // fallthrough
            case EAxis.XY:
              $spell.velvar.y += amount
              $spell.velvar.x += amount
              $spell.velvarconstraint.y = constraint
              $spell.velvarconstraint.x = constraint
              break
            case EAxis.XZ:
              $spell.velvar.z += amount
              $spell.velvar.x += amount
              $spell.velvarconstraint.z = constraint
              $spell.velvarconstraint.x = constraint
              break
            case EAxis.YZ:
              $spell.velvar.y += amount
              $spell.velvar.z += amount
              $spell.velvarconstraint.y = constraint
              $spell.velvarconstraint.z = constraint
              break
            case EAxis.X:
              $spell.velvar.x += amount
              $spell.velvarconstraint.x = constraint
              break
            case EAxis.Y:
              $spell.velvar.y += amount
              $spell.velvarconstraint.y = constraint
              break
            case EAxis.Z:
              $spell.velvar.z += amount
              $spell.velvarconstraint.z = constraint
              break
          }

          for (let atom of $spell.all()) {
            this.velocity.x(
              atom,
              $spell.vel.x +
                $spell.velvar.x * Math.random() -
                $spell.velvar.x / 2 +
                ($spell.velvarconstraint.x * $spell.velvar.x) / 2
            )
            this.velocity.y(
              atom,
              $spell.vel.y +
                $spell.velvar.y * Math.random() -
                $spell.velvar.y / 2 +
                ($spell.velvarconstraint.y * $spell.velvar.y) / 2
            )
            this.velocity.z(
              atom,
              $spell.vel.z +
                $spell.velvar.z * Math.random() -
                $spell.velvar.z / 2 +
                ($spell.velvarconstraint.z * $spell.velvar.z) / 2
            )
          }

          $spell.ripple(ERipple.VELVAR, $spell.velvar)
          $spell.ripple(ERipple.VELVARCONSTRAINT, $spell.velvarconstraint)
          break
        case ESpell.USER_ROT:
          this.universal.userRX(this.timeline.data0(i))
          this.universal.userRY(this.timeline.data1(i))
          this.universal.userRZ(this.timeline.data2(i))
          this.post(EMessage.USER_ROT_UPDATE)
          break
        case ESpell.USER_POS:
          this.universal.userX(this.timeline.data0(i))
          this.universal.userY(this.timeline.data1(i))
          this.universal.userZ(this.timeline.data2(i))
          this.post(EMessage.USER_POS_UPDATE)
          break
        case ESpell.UNI_CLEAR_COLOR:
          this.universal.clearColor(this.timeline.data0(i))
          this.post(EMessage.CLEAR_COLOR_UPDATE)
          break
        case ESpell.UNI_IDLE:
          this.universal.idle(this.timeline.data0(i))
          break
        case ESpell.PHYS_CAGE:
          const min = this.timeline.data1(i)
          const max = this.timeline.data2(i)
          switch (this.timeline.data0(i)) {
            case EAxis.XYZ:
              $spell.cage.min.z = min
              $spell.cage.max.z = max
            // fallthrough
            case EAxis.XY:
              $spell.cage.min.y = min
              $spell.cage.max.y = max
              $spell.cage.min.x = min
              $spell.cage.max.x = max
              break
            case EAxis.XZ:
              $spell.cage.min.x = min
              $spell.cage.max.x = max
              $spell.cage.min.z = min
              $spell.cage.max.z = max
              break
            case EAxis.YZ:
              $spell.cage.min.y = min
              $spell.cage.max.y = max
              $spell.cage.min.z = min
              $spell.cage.max.z = max
              break
            case EAxis.X:
              $spell.cage.min.x = min
              $spell.cage.max.x = max
              break
            case EAxis.Y:
              $spell.cage.min.y = min
              $spell.cage.max.y = max
              break
            case EAxis.Z:
              $spell.cage.min.z = min
              $spell.cage.max.z = max
              break
          }

          $spell.ripple(ERipple.CAGE, $spell.cage)

          for (let atom of $spell.all()) {
            switch (this.timeline.data0(i)) {
              case EAxis.XYZ:
                this.cage.z(atom, min)
                this.cage.mZ(atom, max)
              // fallthrough
              case EAxis.XY:
                this.cage.y(atom, min)
                this.cage.mY(atom, max)
                this.cage.x(atom, min)
                this.cage.mX(atom, max)
                break
              case EAxis.XZ:
                this.cage.x(atom, min)
                this.cage.mX(atom, max)
                this.cage.z(atom, min)
                this.cage.mZ(atom, max)
                break
              case EAxis.YZ:
                this.cage.y(atom, min)
                this.cage.mY(atom, max)
                this.cage.z(atom, min)
                this.cage.mZ(atom, max)
                break
              case EAxis.X:
                this.cage.x(atom, min)
                this.cage.mX(atom, max)
                break
              case EAxis.Y:
                this.cage.y(atom, min)
                this.cage.mY(atom, max)
                break
              case EAxis.Z:
                this.cage.z(atom, min)
                this.cage.mZ(atom, max)
                break
            }
          }
          break
        case ESpell.REZ_FREE:
          for (let atom of $spell.atoms) {
            this.free(atom)
          }
          $spell.atoms = []

          if ($spell.lands > 0) {
            this.post({
              message: EMessage.LAND_REMOVE,
              id: $spell.id,
            })

            $spell.lands = 0
          }

          // TODO: bool for rez/derez to ripple $rez.ripple(ERipple.DEREZ, this)
          break
        // rez time
        case ESpell.REZ:
          toRez.push(i)
          break
        // TODO: useful for bullets and such
        case ESpell.THRUST_TO:
          break
        case ESpell.PHYS_PHASE:
          $spell.phase = this.timeline.data0(i)
          $spell.ripple(ERipple.PHASE, $spell.phase)
          break
        case ESpell.IMPACT:
          $spell.impact = this.timeline.data0(i)
          $spell.ripple(ERipple.IMPACT, $spell.impact)
          break
        case ESpell.THEIA_REALM:
          $spell.land = this.timeline.text(i)
          $spell.ripple(ERipple.LAND, $spell.land)
          break
        case ESpell.THEIA_GATE:
          $spell.gate = this.timeline.text(i)
          break
        case ESpell.THEIA_RULER:
          $spell.ruler = this.timeline.text(i)
          $spell.ripple(ERipple.RULER, $spell.ruler)
          break
      }
    }

    for (let rez of toRez) {
      for (let c = 0; c < this.timeline.data0(rez); c++) {
        this.entity(this.timeline.who(rez))
      }
    }

    // clean up from turn
    for (let def of Object.values(this.forms)) {
      def.dirty.clear()
    }
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

    const atoms = shape.AtomCount($spell.flock.size, $spell.flock.step)
    for (let i = 0; i < atoms; i++) {
      const $shape = shape(i, $spell.flock.size, $spell.flock.step)

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

        this.velocity.x(id, $spell.vel.x)
        this.velocity.y(id, $spell.vel.y)
        this.velocity.z(id, $spell.vel.z)

        this.core(id, color, $spell)
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
    this.velocity.x(
      id,
      $spell.vel.x +
        Math.floor(
          Math.random() * $spell.velvar.x -
            $spell.velvar.x / 2 +
            ($spell.velvarconstraint.x * $spell.velvar.x) / 2
        )
    )
    this.velocity.y(
      id,
      $spell.vel.y +
        Math.floor(
          Math.random() * $spell.velvar.y -
            $spell.velvar.y / 2 +
            ($spell.velvarconstraint.y * $spell.velvar.y) / 2
        )
    )
    this.velocity.z(
      id,
      $spell.vel.z +
        Math.floor(
          Math.random() * $spell.velvar.z -
            $spell.velvar.z / 2 +
            ($spell.velvarconstraint.y * $spell.velvar.y) / 2
        )
    )
    this.core(id, $col, $spell)
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

    for (let i = 0; i < voxDef.xyzi.length / 4; i++) {
      const id = this.reserve()
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
      this.velocity.x(id, $spell.vel.x + rtx)
      this.velocity.y(id, $spell.vel.y + rty)
      this.velocity.z(id, $spell.vel.z + rtz)
      this.core(id, $col2, $spell)
    }
  }

  core(id: number, color: Color, $rez: Spell) {
    this.matter.red(id, Math.floor(color.r * NORMALIZER))
    this.matter.green(id, Math.floor(color.g * NORMALIZER))
    this.matter.blue(id, Math.floor(color.b * NORMALIZER))

    this.matter.phase(id, $rez.phase)
    this.impact.reaction(id, $rez.impact)
    this.cage.box(id, $rez.cage)
  }

  process() {
    const timing = this.universal.musicTime()
    this.lastTime = timing
    // run through timeline and execute rezes
    for (let i = 0; i < this.timeline.length / Timeline.COUNT; i++) {
      const t = this.timeline.when(i)
      this.timing[t] = this.timing[t] || []
      this.timing[t].push(i)

      const def = this.timeline.who(i)

      if (!this.forms[def]) {
        this.forms[def] = new Spell(def)
        const parent = this.timeline.who(def)

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

  timelineUpdated() {
    this.freeAll()
    // clear it
    this.timing = {}
    this.forms = {}

    this.post(EMessage.CLEAR_COLOR_UPDATE)

    this.process()

    this.post(EMessage.TIMELINE_UPDATE)
  }

  freeAll() {
    for (let i = 0; i < ENTITY_COUNT; i++) {
      this.free(i)
    }
    this._available = [...new Array(ENTITY_COUNT)].map((_, i) => i)
  }

  free(i: number) {
    this.animation.free(i)
    this.future.free(i, SpaceTime.COUNT)
    this.past.free(i, SpaceTime.COUNT)
    this.velocity.free(i, Velocity.COUNT)
    this.matter.free(i, Matter.COUNT)
    this.impact.free(i, Impact.COUNT)
    this.size.free(i, Velocity.COUNT)
    this.cage.free(i, Cage.COUNT)
    this.status.free(i)
  }

  available(i: number) {
    this.free(i)
    this._available.push(i)
  }

  reserve: FRez = () => {
    const i = this._available.pop()
    this.free(i)

    this.status.store(i, EStatus.Assigned)
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
      this.timelineUpdated()
    }

    switch (this.universal.idle()) {
      case EIdle.Randomize:
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
