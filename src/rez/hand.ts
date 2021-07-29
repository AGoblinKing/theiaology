import { Group, Matrix4, Vector3 } from 'three'

const keys = [
  'wrist',
  'thumb-metacarpal',
  'thumb-phalanx-proximal',
  'thumb-phalanx-distal',
  'thumb-tip',
  'index-finger-metacarpal',
  'index-finger-phalanx-proximal',
  'index-finger-phalanx-intermediate',
  'index-finger-phalanx-distal',
  'index-finger-tip',
  'middle-finger-metacarpal',
  'middle-finger-phalanx-proximal',
  'middle-finger-phalanx-intermediate',
  'middle-finger-phalanx-distal',
  'middle-finger-tip',
  'ring-finger-metacarpal',
  'ring-finger-phalanx-proximal',
  'ring-finger-phalanx-intermediate',
  'ring-finger-phalanx-distal',
  'ring-finger-tip',
  'pinky-finger-metacarpal',
  'pinky-finger-phalanx-proximal',
  'pinky-finger-phalanx-intermediate',
  'pinky-finger-phalanx-distal',
  'pinky-finger-tip',
]

const $vector3 = new Vector3()

export function HandRez(atom: Matrix4, i: number, hand: Group) {
  // rip through the hand joints and rez something there
  // @ts-ignore
  const j = hand.joints[keys[i]]

  atom
    .compose(j.position, j.quaternion, $vector3.set(0.125, 0.125, 0.125))
    .multiply(hand.matrixWorld)

  return atom
}
