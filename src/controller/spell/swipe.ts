import { angular } from 'src/controller/smooth'
import { IJointGroup } from 'src/input/joints'

const SPEED = 0.75
export function Swipe(hand: IJointGroup) {
  switch (hand.handedness) {
    case 'left':
      // turn left
      angular.set(angular.$ - SPEED)
      break
    case 'right':
      angular.set(angular.$ + SPEED)
      break
  }
}

export function SwipeOther(hand: IJointGroup) {
  switch (hand.handedness) {
    case 'left':
      // turn left
      angular.set(angular.$ + SPEED)
      break
    case 'right':
      angular.set(angular.$ - SPEED)
      break
  }
}
