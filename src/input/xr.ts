import { Value } from 'src/valuechannel'
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
