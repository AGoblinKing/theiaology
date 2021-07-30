import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import { mouse_left, mouse_right } from './input'
import { camera } from './render'
import { delta } from './time'

export const fps = new FirstPersonControls(camera.$, document.body)

fps.lookSpeed = 0.1
fps.movementSpeed = 2
fps.activeLook = false

delta.on(($dt) => {
  fps.update($dt)
  camera.$.position.y = 1.25
  fps.activeLook = mouse_right.$ || mouse_left.$
})
