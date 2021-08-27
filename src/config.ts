const count = parseInt(location.search.slice(1), 10)
export const ENTITY_COUNT = Number.isNaN(count) ? 60000 : count

// For GamePlay, max impacts for entity, the impacts still happen for velocity purposes
export const IMPACTS_MAX_PER = 8
export const TIMELINE_MAX = 1024 * 8

export const SIZE = 0.001
export const FACES = 1
export const MIN_POSE_VALUE = 0.15
export const INFRINGEMENT = 1
// max int 32, which are used in the SharedArrayBuffer
export const NORMALIZER = 0x7fffffff
export const UNIVERSALS = [
  (-20 * 1000) / 2,
  (-20 * 1000) / 2,
  (-20 * 1000) / 2,
  20 * 1000,
  20 * 1000,
  20 * 1000,
  0, // time
  10, // player size
  0, // idle
  0x0055ff, //clear color
  0, // user startx
  0, // user starty
  0, // user startz
  0, // music start time
  0, // rot x
  0, // rot y
  0, // rot z
]

export const CACHE = 'v1'

export const dotTheia = ['forest', 'tread', 'rain']
export const rootTheia = 'forest'

export const PAD_SPEED = 0.5

export const SPONSOR = ['ETHEREUM', 'ETH-QR-CODE', 'GITHUB']

export const USER_SCALE = 100

export function UserUnits(x: number) {
  return x / USER_SCALE
}
