import { angular } from 'src/control/smooth'
import { IJointGroup } from 'src/xr/joints'

export function Swipe(hand: IJointGroup) {
  switch (hand.handedness) {
    case 'left':
      // turn left
      angular.is(angular.$ - 1)
      break
    case 'right':
      angular.is(angular.$ + 1)
      break
  }
}

export function SwipeOther(hand: IJointGroup) {
  switch (hand.handedness) {
    case 'left':
      // turn left
      angular.is(angular.$ + 1)
      break
    case 'right':
      angular.is(angular.$ - 1)
      break
  }
}
