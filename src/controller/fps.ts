import { AXIS, pad_axes } from 'src/input/gamepad'
import { key_down, key_up } from 'src/input/keyboard'
import { mouse_left, mouse_pos, mouse_right } from 'src/input/mouse'
import { delta } from 'src/render/time'
import { Value } from 'src/value'
import { MathUtils, Vector2, Vector3 } from 'three'
import { body, renderer } from '../render/render'
import { velocity } from './smooth'

export const move_inputs = new Value(new Vector3(0, 0, 0))

const CAPS_SPEED = 2
const SPEED = 1

key_down.subscribe(($k) => {
  switch ($k) {
    case 'A':
      move_inputs.$.x = -CAPS_SPEED
      break

    case 'D':
      move_inputs.$.x = CAPS_SPEED
      break
    case 'W':
      move_inputs.$.z = -CAPS_SPEED
      break
    case 'S':
      move_inputs.$.z = CAPS_SPEED
      break
    case 'a':
      move_inputs.$.x = -SPEED
      break
    case 'd':
      move_inputs.$.x = SPEED
      break
    case 'w':
      move_inputs.$.z = -SPEED
      break
    case 's':
      move_inputs.$.z = SPEED
      break
    case 'f':
      move_inputs.$.y = -SPEED
      break
    case 'r':
      move_inputs.$.y = SPEED
      break
  }
})

key_up.subscribe(($k) => {
  switch ($k.toLowerCase()) {
    case 'a':
    case 'd':
      move_inputs.$.x = 0
      break
    case 'w':
    case 's':
      move_inputs.$.z = 0
      break
    case 'r':
    case 'f':
      move_inputs.$.y = 0
      break
  }
})

let timer

function ClearMouse() {
  mouse_left.set(false)
}
let first = true
// emulate mouse_pos updates
pad_axes.subscribe(($axis) => {
  if (timer) {
    clearTimeout(timer)
    timer = undefined
  }

  if (first) {
    first = false
    return
  }

  mouse_left.set(true)
  timer = setTimeout(ClearMouse, 1000)

  mouse_pos.$.x = $axis[AXIS[2]]
  mouse_pos.$.y = -$axis[AXIS[3]]

  move_inputs.$.x = $axis[AXIS[0]] * 5
  move_inputs.$.z = $axis[AXIS[1]] * 5
})

const $vec3 = new Vector3()
let camera_mucked = false

const LOOK_SPEED = 100
const targetPosition = new Vector3()
const vert = new Vector2(0, Math.PI)

let lat = 0
let lon = 0

function UpdateCamera($dt: number) {
  camera_mucked = true
  lon -= mouse_pos.$.x * $dt * LOOK_SPEED
  lat -= (mouse_pos.$.y * $dt * LOOK_SPEED * Math.PI) / (vert.y - vert.x)

  lat = Math.max(-85, Math.min(85, lat))

  targetPosition
    .setFromSphericalCoords(
      1,
      MathUtils.mapLinear(
        MathUtils.degToRad(90 - lat),
        0,
        Math.PI,
        vert.x,
        vert.y
      ),
      MathUtils.degToRad(lon)
    )
    .add(body.position)

  body.lookAt(targetPosition)
}

delta.subscribe(($dt) => {
  // only run not in VR
  if (renderer.xr.isPresenting) {
    if (camera_mucked) {
      camera_mucked = false
      body.quaternion.identity()
    }
    return
  }

  if (move_inputs.$.length() !== 0 || mouse_right.$) {
    velocity.$.add($vec3.copy(move_inputs.$).multiplyScalar($dt * 3))
  }

  if (mouse_right.$ || mouse_left.$) UpdateCamera($dt)
})
