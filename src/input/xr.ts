import { Value } from 'src/value'
import { Uniform, Vector3 } from 'three'
import { IJointGroup } from './joints'
import { left, Phony, right } from './phony'

export const last_pose = new Value({
  left: '',
  right: '',
})

export const pose = new Value({
  left: '',
  right: '',
})

export const hands = new Value<IJointGroup[]>([
  new Phony(left),
  new Phony(right, 'right'),
])

export const left_hand = new Value<IJointGroup>(hands.$[0])
export const right_hand = new Value<IJointGroup>(hands.$[1])
export const VRInit = new Value(false)

export const left_hand_uniforms = {
  ['thumb-tip']: new Uniform(new Vector3()),
  ['index-finger-tip']: new Uniform(new Vector3()),
  ['middle-finger-tip']: new Uniform(new Vector3()),
  ['ring-finger-tip']: new Uniform(new Vector3()),
  ['pinky-finger-tip']: new Uniform(new Vector3()),
}

export const right_hand_uniforms = {
  ['thumb-tip']: new Uniform(new Vector3()),
  ['index-finger-tip']: new Uniform(new Vector3()),
  ['middle-finger-tip']: new Uniform(new Vector3()),
  ['ring-finger-tip']: new Uniform(new Vector3()),
  ['pinky-finger-tip']: new Uniform(new Vector3()),
}
