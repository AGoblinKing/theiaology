import { IJointGroup } from '../vr/joints'
import { snapshotPose } from '../vr/poses'
import { left_hand, right_hand } from '../vr/store'

export function Snapshot(hand: IJointGroup) {
  // take a snapshot of the opposite hand
  switch (hand.handedness) {
    case 'left':
      snapshotPose(right_hand.$)
      break
    case 'right':
      snapshotPose(left_hand.$)
      break
  }
}
