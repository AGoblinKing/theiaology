import { Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { Loop, tick } from '../uniform/time'
import { Value } from '../value/value'

export const scene = new Value(new Scene())
export const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.001,
  10000
)

export const body = new Value(new Group())

body.$.position.set(0, 0, 2.5)
scene.$.add(body.$.add(camera))

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
