import { Vector3 } from 'three'

export const COUNT = 50000

// For GamePlay, max impacts for entity, the impacts still happen for velocity purposes
export const IMPACTS_MAX = 8

export const PHYSICS_BOUNDS = 1000 * 1000
export const GRAVITY = new Vector3(0, -1, 0)
