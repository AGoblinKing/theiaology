// move body smoothly in VR mode

import { mouse_wheel } from 'src/input/mouse'
import { body, camera, renderer } from 'src/render/render'
import { delta, tick } from 'src/uniform/time'
import { Value } from 'src/value/value'
import { Vector3 } from 'three'

export const MIN_VELOCITY = 0.1

export const velocity = new Value(new Vector3(0, 0, -1))
export const angular = new Value(0)

export const walk = new Value()

const velta = new Vector3()

body.$.position.y = renderer.xr.isPresenting ? 0 : 1.5
tick.on(() => {
  if (Math.abs(velocity.$.length()) > MIN_VELOCITY) {
    velta.copy(velocity.$).multiplyScalar(delta.$)

    velocity.$.sub(velta)
    body.$.position.add(
      velta.applyQuaternion(
        renderer.xr.isPresenting ? camera.quaternion : body.$.quaternion
      )
    )
  }

  if (Math.abs(angular.$) > MIN_VELOCITY) {
    const angleta = angular.$ * delta.$

    body.$.rotateY(angleta)

    angular.$ -= angleta
  }
})

mouse_wheel.on(($wheel) => {
  velocity.$.y -= $wheel * 0.001
})
