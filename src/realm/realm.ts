import { ENTITY_COUNT, FACES, INFRINGEMENT, SIZE } from 'src/config'
import { Load } from 'src/input/load'
import { left_hand_uniforms, right_hand_uniforms } from 'src/input/xr'
import { Fate } from 'src/realm/fate'
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
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  ShaderMaterial,
  Uniform,
  Vector3,
} from 'three'
import fragmentShader from './atom.frag'
import vertexShader from './atom.vert'
import { FluxLight } from './flux'

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
  material: ShaderMaterial

  uniCage = new Uniform(new Vector3().setScalar(-Number.MAX_SAFE_INTEGER))
  uniCageM = new Uniform(new Vector3().setScalar(Number.MAX_SAFE_INTEGER))
  uniOffset = new Uniform(new Vector3(0, 0, 0))
  uniSize = new Uniform(new Vector3(1, 1, 1))

  cancels: ICancel[] = []
  flux: FluxLight
  fate = new Value(new Fate())

  destroyed = false

  id = realmId++

  constructor() {
    if (first.$ === undefined) first.set(this)

    this.initMaterial()

    // delay init so reality is set and other things have settled

    this.initAtoms()
    this.initListeners()
  }

  initMaterial() {
    const uniforms = {
      uniCage: this.uniCage,
      uniCageM: this.uniCageM,
      uniOffset: this.uniOffset,
      uniShape: this.uniSize,
      time: timeUniform,
      audioLow: lowerUniform,
      audioHigh: upperUniform,
      cage: this.uniCage,
      cageM: this.uniCageM,
      offset: this.uniOffset,
      uniSize: this.uniSize,
    }
    const addHandUniform =
      (dir) =>
      ([key, value]) => {
        uniforms[`${dir}${key.split('-')[0]}`] = value
      }

    Object.entries(left_hand_uniforms).forEach(addHandUniform('left'))
    Object.entries(right_hand_uniforms).forEach(addHandUniform('right'))

    this.material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    })

    this.flux = new FluxLight(this.material, this.fate)
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
    const arr = new Float32Array(ENTITY_COUNT * 2)
    for (let i = 0; i < ENTITY_COUNT; i++) {
      arr[i * 2] = (i % 256) / 256
      arr[i * 2 + 1] = ~~(i / 256) / 256
    }

    this.atoms = new InstancedMesh(
      new BoxBufferGeometry(
        SIZE * INFRINGEMENT,
        SIZE * INFRINGEMENT,
        SIZE * INFRINGEMENT,
        FACES,
        FACES,
        FACES
      ).setAttribute('reference', new InstancedBufferAttribute(arr, 2)),
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

  cancel = realm.fate.subscribe(() => {
    if (!realm.musicBuffer) return

    audio.src = realm.musicString
    audio.load()

    if (realm.first) {
      audio_name.set(realm.musicName)
      audio_buffer.set(realm.musicBuffer)
    }
  })
})
