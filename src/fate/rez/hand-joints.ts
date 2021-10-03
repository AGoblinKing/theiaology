import { EAnimation } from 'src/buffer/animation'
import { EPhase } from 'src/buffer/phys'
import { NORMALIZER } from 'src/config'
import { doPose } from 'src/controller/hands'
import { vr_keys } from 'src/input/joints'
import { hands, left_hand_uniforms, right_hand_uniforms } from 'src/input/xr'
import { first } from 'src/realm'
import { body } from 'src/render'
import { timing } from 'src/shader/time'
import { EMessage } from 'src/system/enum'
import { SystemWorker } from 'src/system/sys'
import { Color, Vector3 } from 'three'

let hand_joints: number[] = []
const $vec = new Vector3()

// Rezes allow us to inject into the worker simulation from the main thread
export function RezHands(cardinal: SystemWorker) {
  hand_joints = []

  // request the hands
  // vr_keys is an enum and therefore 2x the length, which is what we want
  // for two hands anyhow
  for (let i = 0; i < Object.keys(vr_keys).length; i++) {
    cardinal.send(EMessage.REZ)
    cardinal.waitForEntity((id) => {
      hand_joints.push(id)
    })
  }
}

const rTip = /tip$/
const rMeta = /metacarpal$|proximal$/

const $color = new Color()

// update hand rezes if they exist
timing.on(() => {
  // no hands, nothing to do

  if (hands.$.length === 0) {
    RezHands(first.$.cardinal)
    return
  }
  let gid
  for (let i = 0; i < hand_joints.length; i++) {
    const ix = i % 25
    const iy = Math.floor(i / 25)
    const id = hand_joints[i]

    const j = hands.$[iy]?.joints[vr_keys[ix]]

    if (ix == 0) gid = j

    if (!j) continue

    if (ix === 0) {
      doPose(hands.$[iy])
    }

    $vec
      .copy(j.position)
      .applyQuaternion(body.$.quaternion)
      .add(body.$.position)
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

    let s = Math.floor(rMeta.test(vr_keys[ix]) ? 8 : 5) * 9.5
    if (vr_keys[ix].indexOf('meta') !== -1) {
      s *= 0.75
    }
    const {
      size,
      future,
      phys,
      matter,
      past,
      animation: animation,
      cage,
      universal,
    } = first.$

    animation.store(id, EAnimation.OFF)
    size.x(id, s)
    size.y(id, s)
    size.z(id, s)

    phys.phase(id, EPhase.DIVINE)
    phys.core(id, gid)
    const vari = universal.userHueVariance() / NORMALIZER
    const universalColor = $color.set(universal.userHue())

    // matter.red(id, NORMALIZER - (Math.random() * NORMALIZER) / 5)

    switch (true) {
      case vr_keys[ix] === 'wrist':
        matter.red(id, NORMALIZER)
        matter.green(id, NORMALIZER)
        matter.blue(id, NORMALIZER)
        break

      case vr_keys[ix].indexOf('tip') !== -1 ||
        vr_keys[ix].indexOf('thumb') !== -1:
        matter.red(id, Math.min(1, universalColor.r * 1.15) * NORMALIZER)
        matter.green(id, Math.min(1, universalColor.g * 1.15) * NORMALIZER)
        matter.blue(id, Math.min(1, universalColor.b * 1.5) * NORMALIZER)
        break
      default:
        matter.red(
          id,
          Math.round(universalColor.r * NORMALIZER * (1 - Math.random() * vari))
        )
        matter.green(
          id,
          Math.round(universalColor.g * NORMALIZER * (1 - Math.random() * vari))
        )
        matter.blue(
          id,
          Math.round(universalColor.b * NORMALIZER * (1 - Math.random() * vari))
        )
    }

    $vec.multiplyScalar(1000)
    future.x(id, Math.floor($vec.x))
    future.y(id, Math.floor($vec.y))
    future.z(id, Math.floor($vec.z))

    past.x(id, future.x(id))
    past.y(id, future.y(id))
    past.z(id, future.z(id))
    past.time(id, Math.floor(timing.$))
    future.time(id, Math.floor(timing.$ + 200))
    cage.mX(id, 0)
    cage.mY(id, 0)
    cage.mZ(id, 0)
    cage.x(id, 0)
    cage.y(id, 0)
    cage.z(id, 0)

    // if it has collisions and we're grabbing attach it
  }

  // move user based on hand attachment
})

let cancel
first.on(($r) => {
  if (cancel) cancel()

  cancel = $r.cardinal.onCancel((e) => {
    // Rez the player hands
    switch (e) {
      case EMessage.FATE_UPDATE:
        RezHands($r.cardinal)
        break
    }
  })
})
