// move body smoothly

import { fantasies } from 'src/realm'
import { body, camera, renderer } from 'src/render'
import { delta, timing } from 'src/shader/time'
import { Value } from 'src/value'
import { Vector3 } from 'three'

export const MIN_VELOCITY = 0.3

export const velocity = new Value(new Vector3(0, 0, 0))
export const angular = new Value(0)

export const walk = new Value()

const velta = new Vector3()

let i = 0
timing.on(($t) => {
  const l = Math.abs(velocity.$.length())
  if (l > MIN_VELOCITY) {
    velta.copy(velocity.$).multiplyScalar(delta.$)

    velocity.$.sub(velta)
    body.$.position.add(
      velta.applyQuaternion(
        renderer.xr.isPresenting ? camera.quaternion : body.$.quaternion
      )
    )

    fantasies.$.forEach((f) => {
      f.universal.faeX(body.$.position.x * 2000)
      f.universal.faeY(body.$.position.y * 2000)
      f.universal.faeZ(body.$.position.z * 2000)
    })
  }

  if (Math.abs(angular.$) > MIN_VELOCITY) {
    const angleta = angular.$ * delta.$ * 5

    body.$.rotateY(angleta)

    angular.$ -= angleta
  }
})
