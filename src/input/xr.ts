import { Value } from 'src/util/value'
import { Matrix4, Uniform, Vector3 } from 'three'
import { IJointGroup } from '../xr/joints'

export const last_pose = new Value({
  left: '',
  right: '',
})

export const pose = new Value({
  left: '',
  right: '',
})

export const hands = new Value<IJointGroup[]>([])
export const left_hand = new Value<IJointGroup>()
export const right_hand = new Value<IJointGroup>()
export const VRInit = new Value(false)

// 5x3vectors3
export const left_hand_uniform = new Uniform(new Matrix4())
export const right_hand_uniform = new Uniform(new Matrix4())
