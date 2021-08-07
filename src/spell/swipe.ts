import { angular } from 'src/control/smooth'
import { IJointGroup } from 'src/xr/joints'

export function Swipe(hand: IJointGroup) {
  switch (hand.handedness) {
    case 'left':
      // turn left
      angular.set(angular.$ - 1)
      break
    case 'right':
      angular.set(angular.$ + 1)
      break
  }
}

export function SwipeOther(hand: IJointGroup) {
  switch (hand.handedness) {
    case 'left':
      // turn left
      angular.set(angular.$ + 1)
      break
    case 'right':
      angular.set(angular.$ - 1)
      break
  }
}
