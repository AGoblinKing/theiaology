import { Animation } from 'src/buffer/animation'
import { Cage } from 'src/buffer/cage'
import { Impact } from 'src/buffer/impact'
import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Status } from 'src/buffer/status'
import { Timeline } from 'src/buffer/timeline'
import { Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { voxes } from 'src/buffer/vox'
import { ENTITY_COUNT, FACES, INFRINGEMENT, NORMALIZER, SIZE } from 'src/config'
import { Load } from 'src/file/load'
import { left_hand_uniforms, right_hand_uniforms } from 'src/input/xr'
import { body, renderer, scene } from 'src/render/render'
import AnimationFrag from 'src/shader/animation.frag'
import AnimationVert from 'src/shader/animation.vert'
import EnumVert from 'src/shader/enum.vert'
import HeaderVert from 'src/shader/header.vert'
import MainVert from 'src/shader/main.vert'
import MatterFrag from 'src/shader/matter.frag'
import SpaceTimeVert from 'src/shader/spacetime.vert'
import { lowerUniform, seconds, upperUniform } from 'src/sound/audio'
import { sys, SystemWorker } from 'src/system/sys'
import { EMessage } from 'src/system/sys-enum'
import { tick, timestamp, timeUniform } from 'src/uniform/time'
import { ICancel, Value } from 'src/value/value'
import {
  Box3,
  BoxBufferGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  Uniform,
  Vector3,
} from 'three'

const IDENTITY = new Matrix4().identity()

const lands: { [key: number]: Land[] } = {}
export const first = new Value<Land>(undefined)
export class Land {
  // entity components
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Velocity
  size: Size
  impact: Impact
  animation: Animation
  status: Status

  timeline: Value<Timeline>
  universal: Universal
  cage: Cage

  physics: SystemWorker
  cardinal: SystemWorker

  atoms: InstancedMesh

  timelineJSON = new Value({
    markers: {},
    _: {},
    flat: {},
  })

  material: MeshBasicMaterial

  uniCage: Uniform
  uniCageM: Uniform
  uniOffset: Uniform

  cancels: ICancel[] = []

  destroyed = false

  constructor() {
    if (first.$ === undefined) first.set(this)

    this.velocity = new Velocity()
    this.past = new SpaceTime()

    this.future = new SpaceTime()
    this.animation = new Animation()
    this.matter = new Matter()
    this.impact = new Impact()
    this.size = new Size()
    this.status = new Status()
    this.universal = new Universal()
    this.cage = new Cage()

    this.timeline = new Value(new Timeline())
    this.initMaterial()

    // delay init so reality is set and other things have settled
    setTimeout(() => {
      this.initSystems()
      this.initAtoms()
      this.initListeners()
    }, 0)
  }

  initMaterial() {
    this.material = new MeshBasicMaterial()

    const commonVertChunk = [
      '#include <common>',
      HeaderVert,
      EnumVert,
      AnimationVert,
      SpaceTimeVert,
    ].join('\n')

    const fragmentParsChunk = [
      '#include <common>',
      EnumVert,
      MatterFrag,
      AnimationFrag,
    ].join('\n')

    const colorChunk = [
      `vec4 diffuseColor = AnimationFrag(MatterFrag(vec4( diffuse, opacity)));`,
    ].join('\n')
    const c = this.universal.cage()

    this.uniCage = new Uniform(c.min.clone())
    this.uniCageM = new Uniform(c.max.clone())
    this.uniOffset = new Uniform(this.universal.offset().clone())

    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.time = timeUniform
      shader.uniforms.audioLow = lowerUniform
      shader.uniforms.audioHigh = upperUniform
      shader.uniforms.cage = this.uniCage
      shader.uniforms.cageM = this.uniCageM
      shader.uniforms.offset = this.uniOffset
      const addHandUniform =
        (dir) =>
        ([key, value]) => {
          shader.uniforms[`${dir}${key.split('-')[0]}`] = value
        }

      Object.entries(left_hand_uniforms).forEach(addHandUniform('left'))
      Object.entries(right_hand_uniforms).forEach(addHandUniform('right'))

      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', commonVertChunk)
        .replace('#include <project_vertex>', MainVert)

      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', fragmentParsChunk)
        .replace('vec4 diffuseColor = vec4( diffuse, opacity );', colorChunk)
    }
  }

  initSystems() {
    this.cardinal = sys
      .start('cardinal')
      .send(
        this.past,
        this.future,
        this.matter,
        this.velocity,
        this.size,
        this.animation,
        this.impact,
        this.status,
        this.timeline.$,
        this.universal,
        this.cage
      )
      .on((e) => {
        const data = e
        if (typeof e === 'object') {
          e = e.message
        }

        switch (e) {
          case EMessage.TIMELINE_UPDATE:
            if (!this.first) return
            // clear out accrued lands
            for (let def of Object.keys(lands)) {
              for (let land of lands[def]) {
                land.destroy()
              }

              delete lands[def]
            }
            break
          case EMessage.LAND_REMOVE:
            if (!this.first || !lands[data.id]) return

            for (let land of lands[data.id]) {
              land.destroy()
            }

            delete lands[data.id]

            // remove all lands with that id
            break
          case EMessage.LAND_ADD:
            if (!this.first) return
            if (!lands[data.id]) lands[data.id] = []

            // a new land!
            const land = new Land()
            lands[data.id].push(land)

            land.universalCage(data.cage)
            land.universalOffset(data)

            // now to load a timeline
            land.load(data.ruler, data.land)
            break
          case EMessage.USER_ROT_UPDATE:
            if (!this.fantasy) return
            body.$.rotation.set(
              (this.universal.userRX() / NORMALIZER) * Math.PI * 2,
              (this.universal.userRY() / NORMALIZER) * Math.PI * 2,
              (this.universal.userRZ() / NORMALIZER) * Math.PI * 2
            )

            break
          case EMessage.USER_POS_UPDATE:
            if (!this.fantasy) return
            body.$.position.set(
              this.universal.userX(),
              this.universal.userY(),
              this.universal.userZ()
            )
            break
          case EMessage.CLEAR_COLOR_UPDATE:
            if (!this.fantasy) return
            renderer.setClearColor(this.universal.clearColor())
            break
        }
      })

    this.physics = sys
      .start('physics')
      .send(
        this.past,
        this.future,
        this.matter,
        this.velocity,
        this.size,
        this.impact,
        this.universal,
        this.cage
      )
      .bind(this.cardinal)
  }

  universalCage(cage: Box3) {
    this.universal.cage(cage)
    this.uniCage.value.copy(cage.min)
    this.uniCageM.value.copy(cage.max)
  }

  universalOffset(offset: Vector3) {
    this.universal.offset(offset)
    this.uniOffset.value.copy(offset)
  }

  initListeners() {
    this.cancels.push(
      timestamp.on(() => {
        this.universal.time(timeUniform.value)
      }),
      // update universal
      seconds.on(($s) => {
        if (this.fantasy) this.universal.musicTime($s)
      }),
      tick.on(() => {
        const { atoms } = this
        // Update: WebGL isn't binding the buffer! wow not threejs
        // TODO: Figure out why threejs is not leveraging the sharedarray
        atoms.geometry.getAttribute('animation').needsUpdate = true
        atoms.geometry.getAttribute('past').needsUpdate = true
        atoms.geometry.getAttribute('future').needsUpdate = true
        atoms.geometry.getAttribute('matter').needsUpdate = true
        atoms.geometry.getAttribute('velocity').needsUpdate = true
        atoms.geometry.getAttribute('size').needsUpdate = true
      }),
      this.timeline.on(($t) => {
        if ($t === undefined) return

        this.cardinal.send(EMessage.TIMELINE_UPDATE)
        this.cardinal._queue = []

        if (!this.fantasy) return

        // update the timelineJSON for UI
        this.timelineJSON.set(this.timeline.$.toObject())
      }),
      voxes.on(($voxes) => {
        this.cardinal.send($voxes)
      })
    )
  }

  initAtoms() {
    this.atoms = new InstancedMesh(
      new BoxBufferGeometry(
        SIZE * INFRINGEMENT,
        SIZE * INFRINGEMENT,
        SIZE * INFRINGEMENT,
        FACES,
        FACES,
        FACES
      )
        .setAttribute(
          'animation',
          new InstancedBufferAttribute(this.animation, 1)
        )
        .setAttribute(
          'past',
          new InstancedBufferAttribute(this.past, SpaceTime.COUNT)
        )
        .setAttribute(
          'future',
          new InstancedBufferAttribute(this.future, SpaceTime.COUNT)
        )
        .setAttribute(
          'matter',
          new InstancedBufferAttribute(this.matter, Matter.COUNT)
        )
        .setAttribute(
          'velocity',
          new InstancedBufferAttribute(this.velocity, Velocity.COUNT)
        )
        .setAttribute(
          'size',
          new InstancedBufferAttribute(this.size, Velocity.COUNT)
        ),
      this.material,
      ENTITY_COUNT
    )

    for (let i = 0; i < this.atoms.count; i++) {
      this.atoms.setMatrixAt(i, IDENTITY)
    }

    scene.$.add(this.atoms)
  }

  destroy() {
    if (!this.cardinal) return
    this.cancels.forEach((c) => c())

    this.cardinal.terminate()
    this.physics.terminate()

    delete this.cardinal
    delete this.physics

    scene.$.remove(this.atoms)
    this.atoms.dispose()
    this.destroyed = true
  }

  // load a github repo into this land
  async load(ruler: string, realm: string) {
    console.log('load,', ruler, realm)
    const url = `/github/${ruler}/${realm}`

    if (!cache[url]) cache[url] = fetch(url).then((r) => r.arrayBuffer())
    const data = await cache[url]

    if (this.destroyed) return

    Load(data, this)
  }

  get fantasy() {
    return fantasy.$ === this
  }
  get first() {
    return first.$ === this
  }
}

const cache = {}

export const fantasy = new Value(new Land())
