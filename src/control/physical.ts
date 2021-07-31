// move body smoothly in VR mode

import { body, camera } from 'src/render'
import { Channel, Value } from 'src/store'
import { delta } from 'src/time'
import { Quaternion, Vector3 } from 'three'

export const FRICTION = 0.997
export const MIN_VELOCITY = 0.01
export const velocity = new Value(-1)

export const walk = new Channel()

walk.on(() => {})
const $vec3 = new Vector3(0, 0, -1)
const $quat = new Quaternion()

delta.on(() => {
  if (Math.abs(velocity.$) <= MIN_VELOCITY) return

  const velta = velocity.$ * delta.$

  body.$.position.add(
    $vec3.set(0, 0, velta).applyQuaternion(camera.getWorldQuaternion($quat))
  )
  // always 0 out their height
  body.$.position.y = 1.25

  velocity.$ -= velta * FRICTION
})
