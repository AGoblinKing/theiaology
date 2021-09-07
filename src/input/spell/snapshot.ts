import { IJointGroup } from 'src/input/joints'
import { snapshotPose } from 'src/input/poses'
import { left_hand, right_hand } from 'src/input/xr'

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
