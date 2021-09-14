import { AXIS, pad_axes } from 'src/input/gamepad'
import { key_down, key_up } from 'src/input/keyboard'
import {
  mouse_left,
  mouse_pos,
  mouse_right,
  mouse_wheel,
} from 'src/input/mouse'
import { fantasy } from 'src/realm'
import { body, renderer } from 'src/render'
import { delta } from 'src/shader/time'
import { Value } from 'src/value'
import { MathUtils, Vector2, Vector3 } from 'three'
import { velocity } from './smooth'

export const move_inputs = new Value(new Vector3(0, 0, 0))
export const fly_engaged = new Value(false)

const CAPS_SPEED = 8
const SPEED = 3

key_down.on(($k) => {
  switch ($k) {
    case 'Capslock':
      fly_engaged.set(!fly_engaged.$)
      break

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

key_up.on(($k) => {
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
pad_axes.on(($axis) => {
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
    .add(body.$.position)

  body.$.lookAt(targetPosition)
}

mouse_wheel.on(($wheel) => {
  const { universal } = fantasy.$
  universal.userSize(Math.max(1, universal.userSize() + Math.sign($wheel)))
})

const avg = new Vector3()

delta.on(($dt) => {
  // only run not in VR
  if (renderer.xr.isPresenting) {
    if (camera_mucked) {
      camera_mucked = false
      body.$.quaternion.identity()
    }
    return
  }

  if (move_inputs.$.length() !== 0 || mouse_right.$) {
    velocity.$.add($vec3.copy(move_inputs.$).multiplyScalar($dt * 3))
  }

  if (mouse_right.$ || mouse_left.$) UpdateCamera($dt)

  const avatar = fantasy.$.universal.avatar()
  if (avatar !== -1) {
    const atom = fantasy.$.future.vec3(avatar).multiplyScalar(0.0005)
    atom.y += fantasy.$.size.y(avatar) * 0.0005 + 0.1

    // move us towards the avatar location
    body.$.position.lerp(
      avg.multiplyScalar(9).add(atom).multiplyScalar(0.1),
      $dt * 4
    )

    atom.sub(body.$.position).length() > 0.1 &&
      atom.multiplyScalar(fantasy.$.universal.thrustStrength()).negate()

    // update velocity of avatar
    const { velocity } = fantasy.$
    velocity.addX(avatar, atom.x)
    velocity.addY(avatar, atom.y)
    velocity.addZ(avatar, atom.z)
  }
})
