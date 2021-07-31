import { velocity } from 'src/control/physical'

export const MAX_WALK = 10
export const WALK_SPEED = -1

function DoWalk() {
  velocity.is(Math.min(MAX_WALK, velocity.$ + WALK_SPEED))
}

export const Walk1 = DoWalk
export const Walk2 = DoWalk
