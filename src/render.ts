import { Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { Value } from './store'
import { Loop, tick } from './time'

export const scene = new Value(new Scene())
export const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

export const body = new Value(new Group())

scene.$.add(body.$.add(camera))

export const renderer = new WebGLRenderer()

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
