import { velocity } from 'src/controller/smooth'

export const WALK_SPEED = -1

function DoWalk() {
  velocity.$.y = velocity.$.y + WALK_SPEED
  velocity.poke()
}

export const Walk1 = DoWalk
export const Walk2 = DoWalk
