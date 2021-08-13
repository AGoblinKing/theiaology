import { key_down, key_up } from 'src/input/keyboard'
import { mouse_left, mouse_pos, mouse_right } from 'src/input/mouse'
import { delta } from 'src/uniform/time'
import { Value } from 'src/util/value'
import { MathUtils, Vector2, Vector3 } from 'three'
import { body, renderer } from '../render/render'
import { velocity } from './smooth'

export const move_inputs = new Value(new Vector3(0, 0, 0))

key_down.on(($k) => {
  switch ($k) {
    case 'a':
      move_inputs.$.x = -1
      break
    case 'd':
      move_inputs.$.x = 1
      break
    case 'w':
      move_inputs.$.z = -1
      break
    case 's':
      move_inputs.$.z = 1
      break
  }
})

key_up.on(($k) => {
  switch ($k) {
    case 'a':
    case 'd':
      move_inputs.$.x = 0
      break
    case 'w':
    case 's':
      move_inputs.$.z = 0
      break
  }
})

const $vec3 = new Vector3()
let camera_mucked = false
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
})

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
