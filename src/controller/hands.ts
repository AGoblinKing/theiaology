import { MIN_POSE_VALUE } from 'src/config'
import { poses, poseValue } from 'src/input/poses'
import { renderer, scene } from 'src/render'
import { VRButton } from 'src/VRButton'
import { IJointGroup } from '../input/joints'
import {
  hands,
  last_pose,
  left_hand,
  pose,
  right_hand,
  VRInit,
} from '../input/xr'
import { Value } from '../value'
import { audio } from './audio'
import * as Spells from './spell'

renderer.xr.enabled = true

export type PoseValues = number[][]

export const button = VRButton.createButton(renderer, undefined)

document.body.appendChild(button)

export const onVRClick = new Value(false)

button.addEventListener('click', () => {
  onVRClick.set(true)

  if (VRInit.$) return

  for (let i = 0; i < 2; i++) {
    const hand = renderer.xr.getHand(i) as any

    if (!hand) continue

    scene.$.add(hand)

    hand.addEventListener('connected', (e) => {
      hand.handedness = e.data.handedness
      switch (hand.handedness) {
        case 'left':
          left_hand.set(hand)
          break
        case 'right':
          right_hand.set(hand)
          break
      }
    })

    hands.$.push(hand)

    hands.poke()
  }

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
