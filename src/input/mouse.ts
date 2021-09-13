import { renderer } from 'src/render'
import { Value } from 'src/value'
import { Vector2, Vector3 } from 'three'

// Normalized Mouse Position from center of screen
export const mouse_pos = new Value(new Vector2())
export const mouse_world = new Value(new Vector3())
export const mouse_left = new Value(false)
export const mouse_right = new Value(false)
export const mouse_page = new Value(new Vector2())

function Down(e) {
  switch (e.button) {
    case undefined && e.touches.length === 1:
    case 0:
      mouse_left.set(true)
      break

    case undefined && e.touches.length > 1:
    case 2:
      mouse_right.set(true)

      break
  }
}

function Up(e) {
  switch (e.button) {
    case undefined && e.touches.length === 1:
    case 0:
      mouse_left.set(false)
      break

    case undefined && e.touches.length > 1:
    case 2:
      mouse_right.set(false)

      break
  }
}

function Move(e: MouseEvent) {
  mouse_pos.set(
    mouse_pos.$.set(
      (e.x / renderer.domElement.width) * 2 - 1,
      -(e.y / renderer.domElement.height) * 2 + 1
    )
  )
}

export const mouse_wheel = new Value(0)
renderer.domElement.addEventListener('mousewheel', (e: any) => {
  mouse_wheel.set(-e.wheelDelta)
})

window.addEventListener('mousemove', (e) => {
  mouse_page.set(mouse_page.$.set(e.pageX, e.pageY))
})

renderer.domElement.addEventListener('mousemove', Move)
renderer.domElement.addEventListener('mouseup', Up)
renderer.domElement.addEventListener('touchend', Up)

renderer.domElement.addEventListener('mousedown', Down)
renderer.domElement.addEventListener('touchstart', Down)
renderer.domElement.addEventListener(
  'contextmenu',
  function (evt) {
    evt.preventDefault()
  },
  false
)
