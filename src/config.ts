import { Vector3 } from 'three'

export const ENTITY_COUNT = 50000

// For GamePlay, max impacts for entity, the impacts still happen for velocity purposes
export const IMPACTS_MAX_PER = 8
export const TIMELINE_MAX = 1024
export const PHYSICS_BOUNDS = 1000 * 1000
export const GRAVITY = new Vector3(0, -1, 0)
