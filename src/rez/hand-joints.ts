import { animation, future, matter, past, size } from 'src/buffer'
import { EAnimation } from 'src/buffer/animation'
import { NORMALIZER } from 'src/config'
import { doPose } from 'src/controller/hands'
import { hands, left_hand_uniform, right_hand_uniform } from 'src/input/xr'
import { body } from 'src/render/render'
import { ECardinalMessage } from 'src/system/message'
import { SystemWorker } from 'src/system/sys'
import { timestamp } from 'src/uniform/time'
import { vr_keys } from 'src/xr/joints'
import { Matrix4, Vector3 } from 'three'

let hand_joints: number[] = []
const $vec = new Vector3()

function Init(id: number) {
  animation.store(id, EAnimation.NoEffects)

  size.x(id, 5)
  size.y(id, 5)
  size.z(id, 5)

  matter.red(id, NORMALIZER)
}
// Rezes allow us to inject into the worker simulation from the main thread
export function RezHands(cardinal: SystemWorker) {
  hand_joints = []
  // request the hands
  // vr_keys is an enum and therefore 2x the length, which is what we want
  // for two hands anyhow
  for (let i = 0; i < Object.keys(vr_keys).length; i++) {
    cardinal.send(ECardinalMessage.RequestID)
    cardinal.queue((id) => {
      hand_joints.push(id)
      Init(id)
    })
  }
}

const rTip = /tip$/
// update hand rezes if they exist
timestamp.on(() => {
  // no hands, nothing to do
  if (hands.$.length === 0) return

  let tip = 0
  for (let i = 0; i < hand_joints.length; i++) {
    const ix = i % 25
    const iy = Math.floor(i / 25)
    const id = hand_joints[i]

    const j = hands.$[iy].joints[vr_keys[ix]]

    if (!j) continue

    if (ix === 0) {
      doPose(hands.$[iy])
    }

    Init(id)
    $vec
      .copy(j.position)
      .applyQuaternion(body.$.quaternion)
      .add(body.$.position)
      .multiplyScalar(2)

    if (rTip.test(vr_keys[ix])) {
      let target: Matrix4
      // copy hand pos to the uniforms
      switch (hands.$[iy].handedness) {
        case 'left':
          target = left_hand_uniform.value
          break
        case 'right':
          target = right_hand_uniform.value
      }

      target.elements[tip] = $vec.x
      target.elements[tip + 1] = $vec.y
      target.elements[tip + 2] = $vec.z
    }

    $vec.multiplyScalar(1000)
    future.x(id, Math.floor($vec.x))
    future.y(id, Math.floor($vec.y))
    future.z(id, Math.floor($vec.z))
    past.x(id, future.x(id))
    past.y(id, future.y(id))
    past.z(id, future.z(id))
    past.time(id, Math.floor(timestamp.$))
    future.time(id, Math.floor(timestamp.$))
  }
})
