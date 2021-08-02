import { animation, EAnimation } from 'src/buffer/animation'
import { body } from 'src/render'
import { IJointGroup, vr_keys } from 'src/xr/joints'
import { Matrix4, Quaternion, Vector3 } from 'three'

const $vector3 = new Vector3()
const $pos = new Vector3()
const $quat = new Quaternion()
export function HandRez(
  atom: Matrix4,
  i: number,
  hand: IJointGroup,
  ix: number
) {
  // rip through the hand joints and rez something there
  const j = hand.joints[vr_keys[i]]

  animation.set(ix, EAnimation.NoEffects)

  return atom.compose(
    $pos
      .copy(j.position)
      .applyQuaternion(body.$.quaternion)
      .add(body.$.position),
    $quat.copy(j.quaternion).multiply(body.$.quaternion),
    $vector3.set(0.125, 0.125, 0.125)
  )
}
