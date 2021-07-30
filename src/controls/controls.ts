import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import { camera } from '../render'
import { delta } from '../time'
import { mouse_left, mouse_right } from './desktop'

export const fps = new FirstPersonControls(camera.$, document.body)

fps.lookSpeed = 0.1
fps.movementSpeed = 2
fps.activeLook = false

delta.on(($dt) => {
  fps.update($dt)
  camera.$.position.y = 1.25
  fps.activeLook = mouse_right.$ || mouse_left.$
})
