// move body smoothly

import { fantasies, first, Realm } from 'src/realm'
import { body, camera, renderer } from 'src/render'
import { delta, Timer, timing } from 'src/shader/time'
import { EMessage } from 'src/system/enum'
import { Value } from 'src/value'
import { Vector3 } from 'three'
import { MIDI } from './audio'

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

first.$.senses.on((e) => {
  switch (e) {
    case EMessage.SNS_UPDATE:
      ReactToSenses(first.$)
      break
  }
})

function ReactToSenses(realm: Realm) {
  // if we're feeling things then we need to move away from them
  // if the fingers are collide then see if we're grabbing or pinching
  // also limit the distance from the grab to prevent moving from it
  // if we're grabbing then move towards the hand / do attachment if possible
  // if we're pinching push away from the hand collision
  let i = -1
  while (realm.sensed.id(++i) !== 0) {}
}

// Sound stuff for movement
Timer(200, () => {
  if (i++ % 2 === 0) return

  const l = Math.abs(velocity.$.length())
  if (l < MIN_VELOCITY) return

  // heart
  MIDI(9, 25 + ((i % 2) + (i % 5)), 0.25 + l * 0.01)
  setTimeout(() => {
    MIDI(9, 25 + ((i % 2) + (i % 5)), 0.25 + l * 0.01)
  }, 50)
})
