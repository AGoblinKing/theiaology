import { Value } from 'src/value'
import { Uniform, Vector3 } from 'three'
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

export const left_hand_uniform = new Uniform(new Vector3(0, 0, 0))
export const right_hand_uniform = new Uniform(new Vector3(0, 0, 0))
