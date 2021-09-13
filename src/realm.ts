import { Animation } from 'src/buffer/animation'
import { Cage } from 'src/buffer/cage'
import { Timeline } from 'src/buffer/fate'
import { Impact } from 'src/buffer/impact'
import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Status } from 'src/buffer/status'
import { Thrust } from 'src/buffer/thrust'
import { Universal } from 'src/buffer/universal'
import {
  ENTITY_COUNT,
  FACES,
  INFRINGEMENT,
  NORMALIZER,
  SIZE,
  TOON_ENABLED,
} from 'src/config'
import {
  audio,
  audio_buffer,
  audio_name,
  lowerUniform,
  seconds,
  upperUniform,
} from 'src/controller/audio'
import { isVR, mobile, options } from 'src/input/browser'
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
  InstancedBufferAttribute,
  InstancedMesh,
  Material,
  Matrix4,
  MeshBasicMaterial,
  MeshToonMaterial,
  Uniform,
  Vector3,
} from 'three'

const IDENTITY = new Matrix4().identity()

export const realms: { [key: number]: Realm } = {}

let nextLandCheck = 0

const $vec3 = new Vector3()
const $cage = new Box3()

let i = 0

let realmId = 0

Object.assign(window, { realms })

export const first = new Value<Realm>(undefined)
export class Realm {
  // entity components
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Thrust
  size: Size
  impact: Impact
  animation: Animation
  status: Status

  fate: Value<Timeline>
  universal: Universal
  cage: Cage

  musicName: string
  musicBuffer: DataView
  musicString: string

  physics: SystemWorker
  cardinal: SystemWorker

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

  // the id of the atom that is the user's avatar
  avatar = new Value<number>()

  constructor() {
    if (first.$ === undefined) first.set(this)

    this.velocity = new Thrust()
    this.past = new SpaceTime()

    this.future = new SpaceTime()
    this.animation = new Animation()
    this.matter = new Matter()
    this.impact = new Impact()
    this.size = new Size()
    this.status = new Status()
    this.universal = new Universal()
    this.cage = new Cage()

    this.fate = new Value(new Timeline())
    this.initMaterial()

    // delay init so reality is set and other things have settled
    setTimeout(() => {
      this.initSystems()
      this.initAtoms()
      this.initListeners()
    }, 0)
  }

  initMaterial() {
    this.material =
      !mobile && TOON_ENABLED ? new MeshToonMaterial() : new MeshBasicMaterial()

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
        this.velocity,
        this.size,
        this.animation,
        this.impact,
        this.status,
        this.fate.$,
        this.universal,
        this.cage,
        this.velocity
      )
      .on((e) => {
        const data = e
        if (typeof e === 'object') {
          e = e.message
        }

        switch (e) {
          case EMessage.LAND_REMOVE:
            if (!this.first || !realms[data.id]) return

            realms[data.id].cardinal.postMessage(EMessage.FREE_ALL)
            // remove all lands with that id
            break
          case EMessage.LAND_ADD:
            if (!this.first || isVR.$ || options.$.has('ISOLATE')) return
            if (!realms[data.id]) {
              realms[data.id] = new Realm()
            }

            realms[data.id].universalCage(data.cage)
            realms[data.id].universalOffset(data)
            realms[data.id].universalShape(data.shape)

            // now to load a timeline
            realms[data.id].load(data.ruler, data.land)
            break
          case EMessage.USER_ROT_UPDATE:
            if (!this.fantasy) return
            body.$.rotation.set(
              (this.universal.userRX() / NORMALIZER) * Math.PI * 2,
              (this.universal.userRY() / NORMALIZER) * Math.PI * 2,
              (this.universal.userRZ() / NORMALIZER) * Math.PI * 2
            )

            break
          case EMessage.CARDINAL_TICK:
            const { atoms } = this
            atoms.geometry.getAttribute('animation').needsUpdate = true
            atoms.geometry.getAttribute('matter').needsUpdate = true
            atoms.geometry.getAttribute('size').needsUpdate = true
            break
          case EMessage.USER_POS_UPDATE:
            if (!this.fantasy) return
            body.$.position.copy(
              $vec3
                .set(
                  this.universal.userX(),
                  this.universal.userY(),
                  this.universal.userZ()
                )
                .multiplyScalar(0.01)
                .add(this.universal.offset().multiplyScalar(0.005))
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
        this.cage,
        this.velocity
      )
      .bind(this.cardinal)
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
        if (!this.fantasy && this.slowFantasy++ % 5 !== 0) return

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
          'size',
          new InstancedBufferAttribute(this.size, Thrust.COUNT)
        ),
      this.material,
      ENTITY_COUNT
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
}

const cache = {}

export const fantasy = new Value(new Realm())

let cancel
fantasy.on((realm: Realm) => {
  if (cancel) cancel()

  cancel = realm.fate.on(() => {
    if (!realm.musicBuffer) return

    audio.src = realm.musicString
    audio.load()

    if (realm.first) {
      audio_name.set(realm.musicName)
      audio_buffer.set(realm.musicBuffer)
    }
  })
})
