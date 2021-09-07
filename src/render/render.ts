import { Loop, tick } from 'src/render/time'
import { Value } from 'src/value'
import {
  AmbientLight,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'

export const scene = new Value(new Scene())
export const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.001,
  1000000
)

export const body = new Value(new Group())

body.$.position.set(0, 0.15, 2.5)
const sun = new DirectionalLight(0xffffff, 0.75)
sun.position.set(1, 1, 1)
scene.$.add(body.$.add(camera), new AmbientLight(0xffffff, 0.5), sun)

export const renderer = new WebGLRenderer()

renderer.setClearColor(0x0055ff, 1)

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

let resize = false

window.addEventListener('resize', () => {
  resize = true
})

tick.on(() => {
  renderer.render(scene.$, camera)

  if (resize) {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    resize = false
  }
})

renderer.setAnimationLoop(Loop)
