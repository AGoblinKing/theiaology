import { renderer, scene } from 'src/render/render'
import { Timer, timeUniform } from 'src/render/time'
import { Value } from 'src/value'
import {
  DataTexture,
  FloatType,
  Group,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  SphereBufferGeometry,
  Uniform,
} from 'three'
import {
  GPUComputationRenderer,
  Variable,
} from 'three/examples/jsm/misc/GPUComputationRenderer'
import { Fate } from '../fate/fate'
import Position from './position.frag'
import Thrust from './thrust.frag'
import { yggdrasil } from './yggdrasil'

function Waves(tex: DataTexture) {
  const data = tex.image.data
  for (let i = 0; i < data.length; i++) {
    const n = (i * 0.0001) / (i % 8)
    data[i] = Math.abs(Math.sin(n) + Math.cos(n))
  }

  tex.needsUpdate = true
}

function Waves2(tex: DataTexture) {
  const data = tex.image.data
  for (let i = 0; i < data.length; i++) {
    const n = (i * 0.000001) / (i % 20)
    data[i] = Math.sin(n) + Math.cos(n)
  }

  tex.needsUpdate = true
}

function Randomize(tex: DataTexture) {
  const data = tex.image.data
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random()
  }

  tex.needsUpdate = true
}

const geometry = new SphereBufferGeometry(0.5)
//new BoxBufferGeometry()

export class Quantum {
  compute = new GPUComputationRenderer(256, 256, renderer)

  // x, y, z
  thrust = this.compute.createTexture()

  // x, y, z
  position = this.compute.createTexture()

  // rgba
  color = this.compute.createTexture()

  // x, y, z
  size = this.compute.createTexture()

  cageMin = this.compute.createTexture()
  cageMax = this.compute.createTexture()

  varPos: Variable
  varThrust: Variable

  material: ShaderMaterial
  fate: Fate

  listeners = []

  constructor(material: ShaderMaterial, fate: Value<Fate>) {
    this.listeners.push(
      fate.on(($t) => {
        this.fate = $t
      })
    )

    this.compute.setDataType(FloatType)
    this.setup()

    this.material = material
    const uniforms = material.uniforms
    // xyz, time
    uniforms.positionTex = new Uniform(undefined)

    // rgb, material
    uniforms.colorTex = { value: this.color }

    // xyz, animation
    uniforms.sizeTex = { value: this.size }

    const err = this.compute.init()
    if (err !== null) {
      throw err
    }

    this.material.uniformsNeedUpdate = true
    this.debug()
    Timer(1000 / 60, this.tick.bind(this))
  }

  destroy() {
    this.listeners.forEach((l) => l())
  }

  setup() {
    // bind shaders
    this.varPos = this.compute.addVariable('texPos', Position, this.position)
    this.varThrust = this.compute.addVariable('texThrust', Thrust, this.thrust)
    this.varThrust.material.uniforms.time = timeUniform
    this.compute.setVariableDependencies(this.varPos, [
      this.varPos,
      this.varThrust,
    ])

    this.compute.setVariableDependencies(this.varThrust, [this.varThrust])
  }

  tick() {
    this.compute.compute()

    this.material.uniforms.positionTex.value =
      this.compute.getCurrentRenderTarget(
        this.varPos
        // @ts-ignore
      ).texture

    this.material.uniformsNeedUpdate = true
    // send remote
    yggdrasil.render()
  }

  debug() {
    Waves2(this.thrust)
    Waves(this.position)
    Waves(this.color)
    Randomize(this.size)

    const o3dPos = new Mesh(
      geometry,
      new MeshBasicMaterial({
        map: this.position,
      })
    )
    const o3dThrust = new Mesh(
      geometry,
      new MeshBasicMaterial({
        map: this.thrust,
      })
    )
    const o3dColor = new Mesh(
      geometry,
      new MeshBasicMaterial({
        map: this.color,
      })
    )
    const o3dSize = new Mesh(
      geometry,
      new MeshBasicMaterial({
        map: this.size,
      })
    )

    o3dPos.position.set(0.5, 0.5, 0)
    o3dThrust.position.set(-0.5, 0.5, 0)
    o3dColor.position.set(0.5, -0.5, 0)
    o3dSize.position.set(-0.5, -0.5, 0)

    const g = new Group()
    g.add(o3dPos, o3dThrust, o3dColor, o3dSize)
    const g2 = g.clone()
    g2.rotateY(Math.PI)
    g2.rotateX(Math.PI)

    g2.position.set(0, 0, -1)
    scene.add(g, g2)

    Timer(1000 / 15, () => {
      o3dPos.material.map = this.compute.getCurrentRenderTarget(
        this.varPos
        // @ts-ignore
      ).texture
    })
  }
}
