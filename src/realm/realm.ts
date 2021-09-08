import { ENTITY_COUNT, FACES, INFRINGEMENT, SIZE } from 'src/config'
import { Load } from 'src/input/load'
import { left_hand_uniforms, right_hand_uniforms } from 'src/input/xr'
import { Timeline } from 'src/realm/timeline'
import { MagickaVoxel } from 'src/render/magica'
import { body, scene } from 'src/render/render'
import { runtime, timeUniform } from 'src/render/time'
import {
  audio,
  audio_buffer,
  audio_name,
  lowerUniform,
  seconds,
  upperUniform,
} from 'src/sound/audio'
import { ICancel, Value } from 'src/value'
import {
  Box3,
  BoxBufferGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  MeshBasicMaterial,
  Uniform,
  Vector3,
} from 'three'
import { GPGPU } from './gpgpu'

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
  timeline = new Value(new Timeline())
  musicName: string
  musicBuffer: DataView
  musicString: string

  atoms: InstancedMesh

  timelineJSON = new Value({
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
  gpgpu = new GPGPU()

  destroyed = false
  slowFantasy = i++
  id = realmId++

  constructor() {
    if (first.$ === undefined) first.set(this)

    this.initMaterial()

    // delay init so reality is set and other things have settled
    setTimeout(() => {
      this.initAtoms()
      this.initListeners()
    }, 0)
  }

  initMaterial() {
    this.material = new MeshBasicMaterial()

    this.uniCage = new Uniform(
      new Vector3().setScalar(-Number.MAX_SAFE_INTEGER)
    )
    this.uniCageM = new Uniform(
      new Vector3().setScalar(Number.MAX_SAFE_INTEGER)
    )
    this.uniOffset = new Uniform(new Vector3())
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
    }
  }

  universalCage(cage: Box3) {
    this.uniCage.value = this.uniCage.value.copy(cage.min)
    this.uniCageM.value = this.uniCageM.value.copy(cage.max)
  }

  universalOffset(offset: Vector3) {
    this.uniOffset.value = this.uniOffset.value.copy(offset)
  }

  universalShape(shape: Vector3) {
    this.uniShape.value = this.uniShape.value.copy(shape)
  }

  initListeners() {
    this.cancels.push(
      runtime.subscribe(($t) => {
        // this.universal.time(timeUniform.value)
        // only need to check if first
        if (!this.first) return

        if ($t > nextLandCheck) {
          first.$.updateFantasy()
          nextLandCheck += 1000
        }
      }),
      // update universal
      seconds.subscribe(($s) => {
        // if (this.fantasy) this.universal.musicTime($s)
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
      ),
      this.material,
      ENTITY_COUNT
    )

    for (let i = 0; i < this.atoms.count; i++) {
      this.atoms.setMatrixAt(i, IDENTITY)
    }

    scene.add(this.atoms)
  }

  destroy() {
    this.cancels.forEach((c) => c())

    scene.remove(this.atoms)
    this.atoms.dispose()
    this.destroyed = true
  }

  // load a github repo into this land
  async load(ruler: string, realm: string) {
    const url = `https://theiaology.com/github/${ruler}/${realm}`
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
          .containsPoint($vec3.copy(body.position).multiplyScalar(200))
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
fantasy.subscribe((realm: Realm) => {
  if (cancel) cancel()

  cancel = realm.timeline.subscribe(() => {
    if (!realm.musicBuffer) return

    audio.src = realm.musicString
    audio.load()

    if (realm.first) {
      audio_name.set(realm.musicName)
      audio_buffer.set(realm.musicBuffer)
    }
  })
})
