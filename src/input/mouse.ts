import { Vector2, Vector3 } from 'three'
import { renderer } from '../render'
import { Value } from '../valuechannel'

// Normalized Mouse Position from center of screen
export const mouse_pos = new Value(new Vector2())
export const mouse_world = new Value(new Vector3())
export const mouse_left = new Value(false)
export const mouse_right = new Value(false)

function Down(e) {
  switch (e.button) {
    case undefined && e.touches.length === 1:
    case 0:
      mouse_left.is(true)
      break

    case undefined && e.touches.length > 1:
    case 2:
      mouse_right.is(true)

      break
  }
}

function Up(e) {
  switch (e.button) {
    case undefined && e.touches.length === 1:
    case 0:
      mouse_left.is(false)
      break

    case undefined && e.touches.length > 1:
    case 2:
      mouse_right.is(false)

      break
  }
}

function Move(e: MouseEvent) {
  mouse_pos.is(
    mouse_pos.$.set(
      (e.x / renderer.domElement.width) * 2 - 1,
      -(e.y / renderer.domElement.height) * 2 + 1
    )
  )
}

window.addEventListener('mousemove', Move)
window.addEventListener('mouseup', Up)
window.addEventListener('touchend', Up)

window.addEventListener('mousedown', Down)
window.addEventListener('touchstart', Down)
window.addEventListener(
  'contextmenu',
  function (evt) {
    evt.preventDefault()
  },
  false
)
