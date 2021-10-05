// move body smoothly

import { body, camera, renderer } from 'src/render'
import { delta, timing } from 'src/shader/time'
import { Value } from 'src/value'
import { Vector3 } from 'three'
import { MIDI } from './audio'

export const MIN_VELOCITY = 0.1

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

    if (i++ % 2 === 0) return
    MIDI(84, 40 + (i % 2), 0.2 + l * 0.005)
  }

  if (Math.abs(angular.$) > MIN_VELOCITY) {
    const angleta = angular.$ * delta.$

    body.$.rotateY(angleta)

    angular.$ -= angleta
  }
})
