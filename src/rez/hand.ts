import { IJointGroup, vr_keys } from 'src/vr/joints'
import { Matrix4, Vector3 } from 'three'

const $vector3 = new Vector3()

export function HandRez(atom: Matrix4, i: number, hand: IJointGroup) {
  // rip through the hand joints and rez something there

  const j = hand.joints[vr_keys[i]]

  atom
    .compose(j.position, j.quaternion, $vector3.set(0.125, 0.125, 0.125))
    .multiply(hand.matrixWorld)

  return atom
}
