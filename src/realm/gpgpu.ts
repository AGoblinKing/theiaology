import { multi } from 'src/input/browser'
import { renderer, scene } from 'src/render/render'
import { Timer, timeUniform } from 'src/render/time'
import {
  BoxBufferGeometry,
  DataTexture,
  FloatType,
  Group,
  IntType,
  Mesh,
  MeshBasicMaterial,
  RGBAFormat,
  Uniform,
} from 'three'
import {
  GPUComputationRenderer,
  Variable,
} from 'three/examples/jsm/misc/GPUComputationRenderer'
import { connected, Host, Join } from './friend'
import Position from './position.frag'
import Thrust from './thrust.frag'

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

const geometry = new BoxBufferGeometry()

export class GPGPU {
  compute = new GPUComputationRenderer(256, 256, renderer)

  // x, y, z, decay
  thrust: DataTexture = this.compute.createTexture()

  // x, y, z, time
  position: DataTexture = this.compute.createTexture()

  // rgba
  color: DataTexture = this.compute.createTexture()

  // x, y, z
  size: DataTexture = this.compute.createTexture()

  // RGBA for commands, R command GBA for parameters
  cardinal: DataTexture = this.compute.createTexture()

  // uses i * 2 for indexing needs 8 bits
  timeline = new Uniform(
    new DataTexture(
      new Int32Array(256 * 256 * 4),
      256,
      256,
      RGBAFormat,
      IntType
    )
  )

  varPos: Variable
  varThrust: Variable

  o3dPos = new Mesh(
    geometry,
    new MeshBasicMaterial({
      map: this.position,
    })
  )
  o3dThrust = new Mesh(
    geometry,
    new MeshBasicMaterial({
      map: this.thrust,
    })
  )
  o3dColor = new Mesh(
    geometry,
    new MeshBasicMaterial({
      map: this.color,
    })
  )
  o3dSize = new Mesh(
    geometry,
    new MeshBasicMaterial({
      map: this.size,
    })
  )

  constructor() {
    this.compute.setDataType(FloatType)
    // set uniforms

    // set variables
    this.reset()

    const err = this.compute.init()
    if (err !== null) {
      throw err
    }

    this.o3dPos.position.set(0.5, 0.5, 0)
    this.o3dThrust.position.set(-0.5, 0.5, 0)
    this.o3dColor.position.set(0.5, -0.5, 0)
    this.o3dSize.position.set(-0.5, -0.5, 0)

    const g = new Group()
    g.add(this.o3dPos, this.o3dThrust, this.o3dColor, this.o3dSize)
    const g2 = g.clone()
    g2.rotateY(Math.PI)
    g2.rotateX(Math.PI)

    g2.position.set(0, 0, -1)
    scene.add(g, g2)

    Timer(1000 / 60, this.tick.bind(this))

    this.multiChange = this.multiChange.bind(this)
    multi.on(this.multiChange)
  }

  reset() {
    Waves2(this.thrust)
    Waves(this.position)
    Waves(this.color)
    Randomize(this.size)
    // bind shaders
    this.varPos = this.compute.addVariable('texPos', Position, this.position)
    this.varThrust = this.compute.addVariable('texThrust', Thrust, this.thrust)
    this.varThrust.material.uniforms.time = timeUniform
    this.compute.setVariableDependencies(this.varPos, [
      this.varPos,
      this.varThrust,
    ])

    this.compute.setVariableDependencies(this.varThrust, [this.varThrust])

    // set variable depedencies
  }

  async multiChange($m) {
    if (connected.$) return

    // try to host
    return Host()
      .catch(() => Join())
      .catch(() => {
        setTimeout(this.multiChange, 1000 * 60)
      })
  }

  tick() {
    this.compute.compute()

    this.o3dPos.material.map = this.compute.getCurrentRenderTarget(
      this.varPos
      // @ts-ignore
    ).texture

    // this.o3dThrust.material.map = this.compute.getCurrentRenderTarget(
    //   this.varThrust
    //   // @ts-ignore
    // ).texture
  }
}
