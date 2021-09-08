import { doPose } from 'src/controller/hands'
import { vr_keys } from 'src/input/joints'
import { hands, left_hand_uniforms, right_hand_uniforms } from 'src/input/xr'
import { fantasy } from 'src/realm/realm'
import { body } from 'src/render/render'
import { runtime } from 'src/render/time'
import { Vector3 } from 'three'

let hand_joints: number[] = []
const $vec = new Vector3()

// Rezes allow us to inject into the worker simulation from the main thread
// export function RezHands(cardinal: SystemWorker) {
//   hand_joints = []
//   // request the hands
//   // vr_keys is an enum and therefore 2x the length, which is what we want
//   // for two hands anyhow
//   for (let i = 0; i < Object.keys(vr_keys).length; i++) {
//     cardinal.send(EMessage.REZ)
//     cardinal.waitForEntity((id) => {
//       hand_joints.push(id)
//     })
//   }
// }

const rTip = /tip$/
const rMeta = /metacarpal$|proximal$/

// update hand rezes if they exist
runtime.subscribe(() => {
  // no hands, nothing to do
  if (hands.$.length === 0) return

  for (let i = 0; i < hand_joints.length; i++) {
    const ix = i % 25
    const iy = Math.floor(i / 25)
    const id = hand_joints[i]

    const j = hands.$[iy]?.joints[vr_keys[ix]]

    if (!j) continue

    if (ix === 0) {
      doPose(hands.$[iy])
    }

    $vec
      .copy(j.position)
      .applyQuaternion(body.quaternion)
      .add(body.position)
      .multiplyScalar(2)

    if (rTip.test(vr_keys[ix])) {
      let target
      // copy hand pos to the uniforms
      switch (hands.$[iy].handedness) {
        case 'left':
          target = left_hand_uniforms
          break
        case 'right':
          target = right_hand_uniforms
      }

      target[vr_keys[ix]].value.copy($vec)
    }

    //fantasy.$.animation.store(id, EAnimation.NoEffects)

    const s = Math.floor(rMeta.test(vr_keys[ix]) ? 8 : 5) * 10

    // const { size, future, matter, past } = fantasy.$

    // size.x(id, s)
    // size.y(id, s)
    // size.z(id, s)

    // matter.red(id, NORMALIZER - (Math.random() * NORMALIZER) / 100)
    // $vec.multiplyScalar(1000)

    // future.x(id, Math.floor($vec.x))
    // future.y(id, Math.floor($vec.y))
    // future.z(id, Math.floor($vec.z))
    // past.x(id, future.x(id))
    // past.y(id, future.y(id))
    // past.z(id, future.z(id))
    // past.time(id, Math.floor(runtime.$))
    // future.time(id, Math.floor(runtime.$))
  }
})

let cancel
fantasy.subscribe(($r) => {
  if (cancel) cancel()
  cancel = $r.timeline.subscribe(() => {
    // Rez the player hands
    // if ($r.cardinal) RezHands($r.cardinal)
  })
})
