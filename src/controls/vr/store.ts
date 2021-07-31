import { Value } from 'src/store'
import { IJointGroup } from './interface'

export const last_pose = new Value({
  left: '',
  right: '',
})

export const pose = new Value({
  left: '',
  right: '',
})
export const hand_controllers = new Value<IJointGroup[]>([])
export const left_hand = new Value<IJointGroup>()
export const right_hand = new Value<IJointGroup>()
