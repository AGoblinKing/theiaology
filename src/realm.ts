import { Animation } from 'src/buffer/animation'
import { Cage } from 'src/buffer/cage'
import { Fate } from 'src/buffer/fate'
import { Impact } from 'src/buffer/impact'
import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Thrust } from 'src/buffer/thrust'
import { Traits } from 'src/buffer/traits'
import { Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ATOM_COUNT, FACES, INFRINGEMENT, NORMALIZER, SIZE } from 'src/config'
import {
  audio,
  audio_buffer,
  audio_name,
  Chirp,
  lowerUniform,
  MIDI,
  seconds,
  upperUniform,
} from 'src/controller/audio'
import { isQuest, multiplayer, options } from 'src/input/browser'
import { Load } from 'src/input/load'
import { left_hand_uniforms, right_hand_uniforms } from 'src/input/xr'
import { MagickaVoxel } from 'src/magica'
import { body, renderer, scene } from 'src/render'
import AnimationFrag from 'src/shader/animation.frag'
import AnimationVert from 'src/shader/animation.vert'
import EnumVert from 'src/shader/enum.vert'
import HeaderVert from 'src/shader/header.vert'
import MainVert from 'src/shader/main.vert'
import MatterFrag from 'src/shader/matter.frag'
import SpaceTimeVert from 'src/shader/spacetime.vert'
import { timeUniform, timing } from 'src/shader/time'
import { EMessage } from 'src/system/enum'
import { sys, SystemWorker } from 'src/system/sys'
import { ICancel, Value } from 'src/value'
import {
  Box3,
  BoxBufferGeometry,
  FrontSide,
  InstancedBufferAttribute,
  InstancedMesh,
  Material,
  Matrix4,
  MeshBasicMaterial,
  MeshToonMaterial,
  Uniform,
  Vector3,
} from 'three'
import { Input } from './buffer/input'
import { Phys } from './buffer/phys'
import { Sensed } from './buffer/sensed'
import { LocalSystem } from './system/system'
import { Yggdrasil } from './system/yggdrasil'

const IDENTITY = new Matrix4().identity()

export const realms: { [key: number]: Realm } = {}

let nextLandCheck = 0

const $vec3 = new Vector3()
const $cage = new Box3()

let i = 0

let realmId = 0

Object.assign(window, { realms })

export const fantasy = new Value<Realm>()
export const first = new Value<Realm>(undefined)
export const fantasies = new Value<Realm[]>([])

// @ts-ignore
window.first = first
export class Realm {
  // entity components
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  thrust: Thrust
  velocity: Velocity
  size: Size
  impact: Impact
  animation: Animation
  traits: Traits
  phys: Phys
  sensed: Sensed

  fate: Value<Fate>
  universal: Universal
  input: Input
  cage: Cage

  musicName: string
  musicBuffer: DataView
  musicString: string

  physics: SystemWorker
  cardinal: SystemWorker
  ai: SystemWorker
  senses: SystemWorker

  yggdrasil: LocalSystem

  atoms: InstancedMesh

  fateJSON = new Value({
    markers: {},
    _: {},
    flat: {},
  })

  voxes = new Value<{ [name: string]: MagickaVoxel }>({})
  material: Material

  uniCage: Uniform
  uniCageM: Uniform
  uniOffset: Uniform
  uniShape: Uniform

  cancels: ICancel[] = []

  destroyed = false
  slowFantasy = i++
  id = realmId++

  score = new Value(0)

  // the id of the atom that is the fae's avatar
  avatar = new Value<number>()

  constructor() {
    if (first.$ === undefined) first.set(this)

    fantasies.$.push(this)
    this.thrust = new Thrust()
    this.velocity = new Velocity()

    this.past = new SpaceTime()

    this.future = new SpaceTime()
    this.animation = new Animation()
    this.matter = new Matter()
    this.impact = new Impact()
    this.size = new Size()
    this.traits = new Traits()
    this.universal = new Universal()
    this.cage = new Cage()
    this.phys = new Phys()
    this.sensed = new Sensed()
    this.input = new Input()

    this.fate = new Value(new Fate())
    this.initMaterial()

    this.initSystems()
    this.initAtoms()
    this.initListeners()

    fantasies.poke()
  }

  initMaterial() {
    this.material = isQuest ? new MeshBasicMaterial() : new MeshToonMaterial({})

    if (!isQuest) {
      this.material.shadowSide = FrontSide
    }
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
    this.uniShape = new Uniform(new Vector3(1, 1, 1))

    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.time = timeUniform
      shader.uniforms.audioLow = lowerUniform
      shader.uniforms.audioHigh = upperUniform
      shader.uniforms.cage = this.uniCage
      shader.uniforms.cageM = this.uniCageM
      shader.uniforms.offset = this.uniOffset
      shader.uniforms.shape = this.uniShape

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
        this.thrust,
        this.size,
        this.animation,
        this.impact,
        this.traits,
        this.fate.$,
        this.universal,
        this.cage,
        this.velocity,
        this.phys
      )
      .on((e) => {
        const data = e
        if (typeof e === 'object') {
          e = e.message
        }

        switch (e) {
          case EMessage.CARD_SEEK:
            audio.currentTime = data.time
            setTimeout(
              () => this.cardinal.postMessage(EMessage.CARD_SEEKED),
              500
            )
            break
          case EMessage.UNI_SCORE:
            this.score.set(this.universal.score())
            break
          case EMessage.LAND_REMOVE:
            if (!this.first || !realms[data.id]) return

            realms[data.id].cardinal.postMessage(EMessage.FREE_ALL)
            // remove all lands with that id
            break
          case EMessage.LAND_ADD:
            if (!this.first || isQuest || options.$.has('ISOLATE')) return
            if (!realms[data.id]) {
              realms[data.id] = new Realm()
            }

            realms[data.id].universalCage(data.cage)
            realms[data.id].universalOffset(data)
            realms[data.id].universalShape(data.shape)

            // now to load a timeline
            realms[data.id].load(data.ruler, data.land)
            break
          case EMessage.FAE_ROT_UPDATE:
            if (!this.fantasy) return
            body.$.rotation.set(
              (this.universal.faeRX() / NORMALIZER) * Math.PI * 2,
              (this.universal.faeRY() / NORMALIZER) * Math.PI * 2,
              (this.universal.faeRZ() / NORMALIZER) * Math.PI * 2
            )

            break
          case EMessage.CARD_TICK:
            const { atoms } = this
            atoms.geometry.getAttribute('animation').needsUpdate = true
            atoms.geometry.getAttribute('matter').needsUpdate = true
            atoms.geometry.getAttribute('size').needsUpdate = true
            break
          case EMessage.FAE_POS_UPDATE:
            if (!this.fantasy) return
            body.$.position.copy(
              $vec3
                .set(
                  this.universal.faeX(),
                  this.universal.faeY(),
                  this.universal.faeZ()
                )
                .multiplyScalar(0.01)
                .add(this.universal.offset().multiplyScalar(0.005))
            )
            break
          case EMessage.CLEAR_COLOR_UPDATE:
            if (!this.fantasy) return
            renderer.setClearColor(this.universal.clearColor())
            break

          case EMessage.CARD_MIDI_CHIRP:
            if (!this.fantasy) return
            Chirp(...data.data)
            break

          case EMessage.CARD_MIDI:
            if (!this.fantasy) return

            // @ts-ignore
            MIDI(...data.data)
            break
        }
      })

    this.physics = sys
      .start('physics')
      .send(
        this.past,
        this.future,
        this.matter,
        this.thrust,
        this.size,
        this.impact,
        this.universal,
        this.cage,
        this.velocity,
        this.phys,
        this.input
      )
      .bind(this.cardinal)

    this.ai = sys
      .start('ai')
      .send(
        this.future,
        this.matter,
        this.thrust,
        this.size,
        this.impact,
        this.universal,
        this.velocity,
        this.traits,
        this.phys
      )
      .bind(this.cardinal)

    this.yggdrasil = new Yggdrasil()
      .send(this.future, this.matter, this.size, multiplayer, this.input)
      .bind(this.cardinal)

    this.senses = sys
      .start('senses')
      .send(
        this.future,
        this.matter,
        this.size,
        this.universal,
        this.traits,
        this.sensed,
        this.phys,
        this.velocity,
        this.input
      )
  }

  universalCage(cage: Box3) {
    this.universal.cage(cage)
    this.uniCage.value = this.uniCage.value.copy(cage.min)
    this.uniCageM.value = this.uniCageM.value.copy(cage.max)
  }

  universalOffset(offset: Vector3) {
    this.universal.offset(offset)
    this.uniOffset.value = this.uniOffset.value.copy(offset)
  }

  universalShape(shape: Vector3) {
    this.uniShape.value = this.uniShape.value.copy(shape)
  }

  initListeners() {
    this.cancels.push(
      timing.on(($t) => {
        this.universal.time(timeUniform.value)
        // only need to check if first
        if (!this.first && !this.fantasy && this.slowFantasy++ % 10 !== 0)
          return

        const { atoms } = this
        atoms.geometry.getAttribute('past').needsUpdate = true
        atoms.geometry.getAttribute('future').needsUpdate = true

        if (!this.first) return

        if ($t > nextLandCheck) {
          first.$.updateFantasy()
          nextLandCheck += 1000
        }
      }),
      // update universal
      seconds.on(($s) => {
        if (this.fantasy) this.universal.musicTime($s)
      }),

      this.fate.on(($t) => {
        if ($t === undefined) return

        this.cardinal.send(EMessage.FATE_UPDATE)
        this.cardinal._queue = []
        this.score.set(0)

        if (!this.first) return

        // update the timelineJSON for UI
        this.fateJSON.set(this.fate.$.toObject())
      }),
      this.voxes.on(($voxes) => {
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
          new InstancedBufferAttribute(this.animation, Animation.COUNT)
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
          'size',
          new InstancedBufferAttribute(this.size, Thrust.COUNT)
        ),
      this.material,
      ATOM_COUNT
    )

    for (let i = 0; i < this.atoms.count; i++) {
      this.atoms.setMatrixAt(i, IDENTITY)
    }
    const { atoms } = this
    atoms.geometry.getAttribute('animation').needsUpdate = true
    atoms.geometry.getAttribute('matter').needsUpdate = true
    atoms.geometry.getAttribute('size').needsUpdate = true
    atoms.geometry.getAttribute('past').needsUpdate = true
    atoms.geometry.getAttribute('future').needsUpdate = true

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

    fantasies.$.slice(fantasies.$.indexOf(this), 1)
    fantasies.poke()
    this.destroyed = true
  }

  // load a github repo into this land
  async load(ruler: string, realm: string) {
    const url = `/github/${ruler}/${realm}`
    if (!cache[url]) cache[url] = fetch(url).then((r) => r.arrayBuffer())
    const data = await cache[url]

    Load(data, this)
  }

  updateFantasy() {
    // check bounding box of all lands and update fantasy if needed
    let realm: Realm = this

    for (let r of Object.values(realms)) {
      $cage.min.copy(r.uniCage.value).multiplyScalar(0.1)
      $cage.max.copy(r.uniCageM.value).multiplyScalar(0.1)

      if (
        !$cage
          .translate(r.uniOffset.value)
          .containsPoint($vec3.copy(body.$.position).multiplyScalar(200))
      ) {
        continue
      }

      realm = r

      break
    }

    if (fantasy.$ === realm) return

    fantasy.set(realm)
  }

  get fantasy() {
    return fantasy.$ === this
  }
  get first() {
    return first.$ === this
  }

  clearRealms() {
    Object.entries(realms).forEach(([k, r]) => {
      delete realms[k]
      r.destroy()
    })
  }
}

const cache = {}

let cancel
fantasy.on((realm: Realm) => {
  if (!realm) return

  if (cancel) cancel()

  cancel = realm.fate.on(() => {
    if (!realm.musicBuffer) return

    const playing = !audio.paused

    audio.src = realm.musicString
    timeUniform.value = audio.currentTime = realm.universal.musicTime()

    playing && audio.play()

    if (realm.first) {
      audio_name.set(realm.musicName)
      audio_buffer.set(realm.musicBuffer)
    }
  })
})

fantasy.set(new Realm())
