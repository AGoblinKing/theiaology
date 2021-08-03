import { animation } from 'src/buffer'
import { EAnimation } from 'src/buffer/animation'
import { left_hand_uniform, right_hand_uniform } from 'src/input/xr'
import { body } from 'src/render'
import { IJointGroup, vr_keys } from 'src/xr/joints'
import { Matrix4, Vector3 } from 'three'

const $vector3 = new Vector3()

export function HandRez(
  atom: Matrix4,
  i: number,
  hand: IJointGroup,
  ix: number
) {
  // rip through the hand joints and rez something there
  const j = hand.joints[vr_keys[i]]

  const pos = j.position.applyQuaternion(body.$.quaternion).add(body.$.position)

  Atomics.store(animation, ix, EAnimation.NoEffects)
  if (vr_keys[i] === 'index-finger-tip') {
    // copy hand pos to the uniforms
    switch (hand.handedness) {
      case 'left':
        left_hand_uniform.value = left_hand_uniform.value.copy(pos)

        break
      case 'right':
        right_hand_uniform.value = right_hand_uniform.value.copy(pos)
    }
  }

  return atom.compose(
    pos,
    j.quaternion.multiply(body.$.quaternion),
    $vector3.set(0.125, 0.125, 0.125)
  )
}
