importScripts('/build/three.js')

import { Animation } from 'src/buffer/animation'
import { Impact } from 'src/buffer/impact'
import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { EStatus, Status } from 'src/buffer/status'
import { Timeline } from 'src/buffer/timeline'
import { Velocity } from 'src/buffer/velocity'
import { voxes } from 'src/buffer/vox'
import { ENTITY_COUNT, NORMALIZER } from 'src/config'
import { ShapeMap } from 'src/shape'
import { ETimeline, Rez } from 'src/timeline/def-timeline'
import { Color, Euler, Object3D, Vector3 } from 'three'
import { ECardinalMessage } from './message'
import { System } from './system'

const $rez = new Rez()
const $hsl = { h: 0, s: 0, l: 0 }
const $col = new Color()
const $col2 = new Color()
const $eule = new Euler()
const $o3d = new Object3D()
const $vec3 = new Vector3()
const $vec3_o = new Vector3()

// Deal out entity IDs, execute timeline events
class Cardinal extends System {
  _available: number[] = [...new Array(ENTITY_COUNT)].map((i) => i)
  ticks = 0
  // entity components
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Velocity
  size: Size
  impact: Impact
  animation: Animation
  status: Status

  // world components
  timeline: Timeline
  defines: { [key: number]: number[] } = []

  ready = false
  // performance.now()
  timing: number

  constructor() {
    super(20)
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
              case ECardinalMessage.RequestID:
                this.post(this.reserve())
                break

              case ECardinalMessage.FreeAll:
                this.freeAll()
                break
              case ECardinalMessage.TimelineUpdated:
                this.timelineUpdated()
                break
            }
            return
        }
    }
  }

  // Entity ID number to init
  entity(def: number, offset: number) {
    // navigate up the tree to root
    // build for loops to apply
    const define = this.defines[def]
    if (define === undefined) {
      throw new Error('invalid define number for flat timelinemap')
    }

    // fill out the Rez then execute it
    // not cached because timeline has a time dependency
    // so could be differnet every second
    // also allows editor to not request a rebuild
    // if the structure doesn't change

    $rez.reset()

    // TODO: check time when applying
    for (let child of define) {
      switch (this.timeline.command(child)) {
        case ETimeline.SIZEVAR:
          $rez.sizevar.set(
            this.timeline.data0(child),
            this.timeline.data1(child),
            this.timeline.data2(child)
          )
          break
        case ETimeline.ROTVAR:
          $rez.rotvar.set(
            this.timeline.data0(child),
            this.timeline.data1(child),
            this.timeline.data2(child)
          )
          break
        case ETimeline.ROT:
          $rez.rot.set(
            this.timeline.data0(child),
            this.timeline.data1(child),
            this.timeline.data2(child)
          )
          break
        case ETimeline.LOOK:
          $rez.doLook = true
          $rez.look.set(
            this.timeline.data0(child),
            this.timeline.data1(child),
            this.timeline.data2(child)
          )

          break
        case ETimeline.VOX:
          $rez.vox = this.timeline.text(child)
          break
        case ETimeline.FLOCK:
          $rez.flock.shape = this.timeline.data0(child)
          $rez.flock.size = this.timeline.data1(child)
          $rez.flock.step = this.timeline.data2(child)
          break
        case ETimeline.SIZE:
          $rez.size.x = this.timeline.data0(child)
          $rez.size.y = this.timeline.data1(child)
          $rez.size.z = this.timeline.data2(child)
          break
        case ETimeline.COLOR:
          const rgb = this.timeline.data0(child)
          $rez.color.setHex(rgb)
          $rez.col.tilt = this.timeline.data1(child)
          $rez.col.variance = this.timeline.data2(child)

          break
        case ETimeline.POSVAR:
          $rez.posvar.x = this.timeline.data0(child)
          $rez.posvar.y = this.timeline.data1(child)
          $rez.posvar.z = this.timeline.data2(child)
          break
        case ETimeline.POS:
          $rez.pos.x = this.timeline.data0(child)
          $rez.pos.y = this.timeline.data1(child)
          $rez.pos.z = this.timeline.data2(child)
          break
        case ETimeline.THRUST:
          $rez.vel.set(
            this.timeline.data0(child),
            this.timeline.data1(child),
            this.timeline.data2(child)
          )
          break
        case ETimeline.THRUSTVAR:
          $rez.velvar.set(
            this.timeline.data0(child),
            this.timeline.data1(child),
            this.timeline.data2(child)
          )
          break

        // TODO: useful for bullets and such
        case ETimeline.THRUSTTO:
          break
        case ETimeline.PHASE:
          $rez.phase = this.timeline.data0(child)
          break
        case ETimeline.IMPACT:
          $rez.impact = this.timeline.data0(child)
          break
      }
    }

    // now we rez
    // determine voxel count, for loop over them
    const shape = ShapeMap[$rez.flock.shape]
    if (!shape) {
      throw new Error("couldn't find shape on shapemap" + $rez.flock.shape)
    }

    const atoms = shape.AtomCount($rez.flock.size, $rez.flock.step)

    for (let i = 0; i < atoms; i++) {
      const $shape = shape(i, $rez.flock.size, $rez.flock.step)

      // apply $rez data

      const x =
        $rez.pos.x +
        $shape.x +
        Math.round($rez.posvar.x * Math.random() * 2 - $rez.posvar.x)
      const y =
        $rez.pos.y +
        $shape.y +
        Math.round($rez.posvar.y * Math.random() * 2 - $rez.posvar.y)

      const z =
        $rez.pos.z +
        $shape.z +
        Math.round($rez.posvar.z * Math.random() * 2 - $rez.posvar.z)

      $col
        .setRGB(Math.random(), Math.random(), Math.random())
        .lerp($rez.color, (NORMALIZER - $rez.col.variance) / NORMALIZER)

      // tilt
      $col.getHSL($hsl)

      const ts = $hsl.s
      const tl = $hsl.l

      $col.setHSL($hsl.h + $rez.col.tilt / NORMALIZER, $hsl.s, $hsl.l)

      const sx = $rez.size.x + Math.round(Math.random() * $rez.sizevar.x)
      const sy = $rez.size.y + Math.round(Math.random() * $rez.sizevar.y)
      const sz = $rez.size.z + Math.round(Math.random() * $rez.sizevar.z)
      if ($rez.vox !== '' && voxes.$[$rez.vox]) {
        // vox miss, but could be because we haven't loaded $voxes yet
        const voxDef = voxes.$[$rez.vox]

        const variance = ($rez.col.variance / NORMALIZER) * Math.random()
        let rx = ($rez.rotvar.x / NORMALIZER) * Math.random() * Math.PI * 2
        let ry = ($rez.rotvar.y / NORMALIZER) * Math.random() * Math.PI * 2
        let rz = ($rez.rotvar.z / NORMALIZER) * Math.random() * Math.PI * 2

        if ($rez.doLook) {
          $o3d.position.set(x, $rez.look.y, z)
          $o3d.lookAt($rez.look)
          $eule.setFromQuaternion($o3d.quaternion)

          $eule.y += ($rez.rot.y / NORMALIZER) * Math.PI * 2
          $eule.z += ($rez.rot.z / NORMALIZER) * Math.PI * 2
          $eule.x += ($rez.rot.x / NORMALIZER) * Math.PI * 2
        } else {
          $eule.set(
            rx + ($rez.rot.x / NORMALIZER) * Math.PI * 2,
            ry + ($rez.rot.y / NORMALIZER) * Math.PI * 2,
            rz + ($rez.rot.z / NORMALIZER) * Math.PI * 2
          )
        }

        for (let i = 0; i < voxDef.xyzi.length / 4; i++) {
          const id = this.reserve()

          const ix = i * 4

          $vec3
            .set(
              voxDef.xyzi[ix] * sx * 10,
              voxDef.xyzi[ix + 2] * sy * 10,
              voxDef.xyzi[ix + 1] * sz * 10
            )

            .applyEuler($eule)
            .add($vec3_o.set(x, y, z))

          this.future.time(id, this.timing + 1000 * Math.random() + 500)
          this.future.x(id, $vec3.x + Math.round(Math.random() * 2 - 1))
          this.future.y(id, $vec3.y + Math.round(Math.random() * 2 - 1))
          this.future.z(id, $vec3.z + Math.round(Math.random() * 2 - 1))

          // -1 because magica?
          const c = (voxDef.xyzi[ix + 3] - 1) * 4

          $col2
            .setRGB(
              voxDef.rgba[c] / 255,
              voxDef.rgba[c + 1] / 255,
              voxDef.rgba[c + 2] / 255
            )
            .getHSL($hsl)

          $col2.setHSL(
            ($hsl.h +
              $rez.col.tilt / NORMALIZER +
              variance +
              Math.random() * 0.05) %
              1,
            ($hsl.s + ts) / 2,
            ($hsl.l + tl) / 2
          )

          this.size.x(id, sx)
          this.size.y(id, sy)
          this.size.z(id, sz)

          this.basics(id, $col2)
        }
        continue
      }

      const id = this.reserve()

      this.future.time(id, this.timing + 1000 * Math.random() + 500)
      this.future.x(id, x)
      this.future.y(id, y)
      this.future.z(id, z)

      this.size.x(id, sx)
      this.size.y(id, sy)
      this.size.z(id, sz)

      this.basics(id, $col)
    }
  }

  basics(id: number, color: Color) {
    this.matter.red(id, Math.floor(color.r * NORMALIZER))
    this.matter.green(id, Math.floor(color.g * NORMALIZER))
    this.matter.blue(id, Math.floor(color.b * NORMALIZER))

    this.velocity.x(id, $rez.vel.x + Math.random() * $rez.velvar.x)
    this.velocity.y(id, $rez.vel.y + Math.random() * $rez.velvar.y)
    this.velocity.z(id, $rez.vel.z + Math.random() * $rez.velvar.z)

    this.matter.phase(id, $rez.phase)
    this.impact.reaction(id, $rez.impact)
  }

  timelineUpdated() {
    this.freeAll()
    // clear it
    this.defines = []

    // could have just passed the object instead of buffer nonsense, but useful for saves

    const toRez = []
    // run through timeline and execute rezes
    for (let i = 0; i < this.timeline.length / Timeline.COUNT; i++) {
      const who = this.timeline.who(i)

      if (!this.defines[who]) {
        this.defines[who] = []
      }

      this.defines[who].push(i)

      switch (this.timeline.command(i)) {
        // rez time
        case ETimeline.REZ:
          toRez.push(i)
          break
      }
    }

    for (let rez of toRez) {
      for (let c = 0; c < this.timeline.data0(rez); c++) {
        this.entity(this.timeline.who(rez), c)
      }
    }
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
    this.status.free(i)
  }

  available(i: number) {
    this.free(i)
    this._available.push(i)
  }

  reserve() {
    const i = this._available.pop()
    this.free(i)

    this.status.store(i, EStatus.Assigned)
    return i
  }

  tick() {
    this.timing = Math.floor(performance.now())
    if (this.ready) this.randomize()
  }

  randomize() {
    const scale = 18000
    const t = this.timing

    const chunk = (this.tickrate / 1000) * ENTITY_COUNT * 0.05
    // lets prove out thhese even render
    for (let ix = last; ix < last + chunk; ix++) {
      // only use left overs
      const i = this._available[ix % this._available.length]
      this.past.x(i, this.future.x(i))
      this.past.y(i, this.future.y(i))
      this.past.z(i, this.future.z(i))
      this.past.time(i, t)

      this.future.x(i, Math.floor(Math.random() * scale - scale / 2))
      this.future.y(i, Math.floor((Math.random() * scale) / 2))
      this.future.z(i, Math.floor(Math.random() * scale - scale / 2))
      this.future.time(i, t + 30000 + 100)

      const s = 1

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
