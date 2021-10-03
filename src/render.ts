import { Loop, tick } from 'src/shader/time'
import { Value } from 'src/value'
import {
  AmbientLight,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'
import { isQuest } from './input/browser'

export const scene = new Value(new Scene())
export const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  10000000
)

export const body = new Value(new Group())

body.$.position.set(0, 0.15, 2.5)
const sun = new DirectionalLight(0xffffff, 0.35)
sun.position.set(1, 1, 1)
const sun2 = sun.clone()
sun.position.set(-1, 1, -1)
scene.$.add(body.$.add(camera), new AmbientLight(0xffffff, 0.5), sun, sun2)

export const renderer = new WebGLRenderer({
  antialias: !isQuest,
  preserveDrawingBuffer: !isQuest,
})

renderer.domElement.id = 'three'
renderer.domElement.addEventListener('click', () => {
  // @ts-ignore
  document.activeElement.blur()

  renderer.domElement.focus()
})
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
