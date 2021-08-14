import { Vector3 } from 'three'

export const ENTITY_COUNT = 60000

// For GamePlay, max impacts for entity, the impacts still happen for velocity purposes
export const IMPACTS_MAX_PER = 8
export const TIMELINE_MAX = 1024 * 8
export const PHYSICS_BOUNDS = 1000 * 1000
export const GRAVITY = new Vector3(0, -1, 0)

export const SIZE = 0.01
export const FACES = 1
export const NORMALIZER = 0x7fffffff
export const CACHE = 'v1'
