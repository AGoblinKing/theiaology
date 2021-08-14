import { velocity } from 'src/controller/smooth'

export const WALK_SPEED = 0.75

function DoWalk() {
  velocity.$.z -= WALK_SPEED
}

export const Walk1 = DoWalk
export const Walk2 = DoWalk
