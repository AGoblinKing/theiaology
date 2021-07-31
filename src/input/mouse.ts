import { Vector3 } from 'three'
import { renderer } from '../render'
import { Value } from '../store'

const $c = renderer.domElement

// Normalized Mouse Position from center of screen
export const mouse_pos = new Value([0, 0])
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

function Move(e) {}

$c.addEventListener('mousemove', Move)
$c.addEventListener('mouseup', Up)
$c.addEventListener('touchend', Up)

$c.addEventListener('mousedown', Down)
$c.addEventListener('touchstart', Down)
window.addEventListener(
  'contextmenu',
  function (evt) {
    evt.preventDefault()
  },
  false
)
