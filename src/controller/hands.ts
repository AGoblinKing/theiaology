import { MIN_POSE_VALUE } from 'src/config'
import { left_controller, right_controller } from 'src/input/phony'
import { poses, poseValue } from 'src/input/poses'
import { renderer } from 'src/render'
import { Timer } from 'src/shader/time'
import { VRButton } from 'src/VRButton'
import { IJointGroup } from '../input/joints'
import { last_pose, pose, VRInit } from '../input/xr'
import { Value } from '../value'
import { audio } from './audio'
import * as Spells from './spell'

renderer.xr.enabled = true

export type PoseValues = number[][]

export const button = VRButton.createButton(renderer, undefined)

document.body.appendChild(button)

export const onVRClick = new Value(false)

Timer(200, () => {
  if (!VRInit.$) return

  const session = renderer.xr.getSession()
  let i = 0

  if (!session || !session.inputSources) return

  for (const source of session.inputSources) {
    switch (true) {
      case source.gamepad !== undefined: {
        const pad = renderer.xr.getController(i)
        pad.userData = source.gamepad
        switch (source.handedness) {
          case 'right':
            left_controller.$ = pad
            break
          default:
            right_controller.$ = pad
            break
        }
        break
      }
      case source.hand !== undefined: {
        const pad = renderer.xr.getHand(i)
        switch (source.handedness) {
          case 'left':
            left_controller.$ = pad
            break
          default:
            right_controller.$ = pad
            break
        }
        break
      }
    }

    i++
  }
})

button.addEventListener('click', () => {
  onVRClick.set(true)

  audio.play()

  VRInit.set(true)
})

// return the variance from the two posts
function comparePose(p1: PoseValues, p2: PoseValues): number {
  return p1.reduce(
    (sum, arr, j) =>
      arr.reduce((s_sum, v, i) => {
        return s_sum + Math.abs(v - p2[j][i])
      }, sum),
    0
  )
}

pose.on((v) => requestAnimationFrame(() => last_pose.set(v)))

export function doPose(hand: IJointGroup) {
  const handPoseValue = poseValue(hand)
  let winner
  let valueToBeat = MIN_POSE_VALUE

  // calc hand pose deltas
  Object.entries(poses[hand.handedness]).forEach(([key, value]) => {
    const res = comparePose(value, handPoseValue)
    if (res > valueToBeat) {
      return
    }
    winner = key
    valueToBeat = res
  })

  const lastPose = pose.$[hand.handedness]
  if (winner && winner !== lastPose) {
    pose.$[hand.handedness] = winner
    pose.poke()

    if (Spells[winner]) {
      Spells[winner](hand)
    }

    const k = `Un${lastPose}`
    if (Spells[k]) {
      Spells[k](hand)
    }
  } else if (winner === undefined && lastPose) {
    pose.$[hand.handedness] = ''

    const k = `Un${lastPose}`
    if (Spells[k]) {
      Spells[k](hand)
    }
  }
}
