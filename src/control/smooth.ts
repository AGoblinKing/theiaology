// move body smoothly in VR mode

import { body, camera, renderer } from 'src/render'
import { delta, doStatic } from 'src/time'
import { Channel, Value } from 'src/valuechannel'
import { Vector3 } from 'three'

export const FRICTION = 0.995
export const MIN_VELOCITY = 0.01

export const velocity = new Value(-1)
export const angular = new Value(0)

export const walk = new Channel()

const $vec3 = new Vector3(0, 0, -1)

doStatic.on(() => {
  if (Math.abs(velocity.$) > MIN_VELOCITY) {
    const velta = velocity.$ * delta.$

    body.$.position.add(
      $vec3
        .set(0, 0, velta)
        .applyQuaternion(
          renderer.xr.isPresenting ? camera.quaternion : body.$.quaternion
        )
    )
    // always 0 out their height

    velocity.$ -= velta * FRICTION
  }
  body.$.position.y = renderer.xr.isPresenting ? 0 : 1.5
  if (Math.abs(angular.$) > MIN_VELOCITY) {
    const angelta = angular.$ * delta.$

    body.$.rotateY(angelta)

    angular.$ -= angelta * FRICTION
  }
})
