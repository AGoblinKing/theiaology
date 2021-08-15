const count = parseInt(location.search.slice(1), 10)
export const ENTITY_COUNT = Number.isNaN(count) ? 60000 : count

// For GamePlay, max impacts for entity, the impacts still happen for velocity purposes
export const IMPACTS_MAX_PER = 8
export const TIMELINE_MAX = 1024 * 8

export const SIZE = 0.01
export const FACES = 1

// max int 32, which are used in the SharedArrayBuffer
export const NORMALIZER = 0x7fffffff
export const UNIVERSALS = [
  (-20 * 1000) / 2,
  (-20 * 1000) / 2,
  (-20 * 1000) / 2,
  20 * 1000,
  20 * 1000,
  20 * 1000,
]

export const CACHE = 'v1'
