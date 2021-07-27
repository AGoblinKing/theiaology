import { renderer } from './render'
import { Value } from './store'

const $c = renderer.$.domElement

export const mouse_left = new Value(false)
export const mouse_right = new Value(false)

const down = (e) => {
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

$c.addEventListener('mousedown', down)
$c.addEventListener('touchstart', down)

const up = (e) => {
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

$c.addEventListener('mouseup', up)
$c.addEventListener('touchend', up)

window.addEventListener(
  'contextmenu',
  function (evt) {
    evt.preventDefault()
  },
  false
)
