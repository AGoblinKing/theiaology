export const ATOM_COUNT = 256 * 256

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
  // default universal cage
  -NORMALIZER / 2,
  -NORMALIZER / 2,
  -NORMALIZER / 2,
  NORMALIZER,
  NORMALIZER,
  NORMALIZER,
  // offset
  0,
  0,
  0,
  // ERealmState
  1, // RUNNING
  -1, // no avatar
  1, // thrust strength is 1 normally
  0, // SCORE
  0,
  0,
  0, // gravity
  0xff0011, // user color
  0.1 * NORMALIZER, // user hue variance
]

export const CACHE = 'v2'

export const dotTheia = [
  'aero',
  'rpg',
  'overworld',
  'starvoyage',
  'forest',
  'flood',
  'birthday',
  'city',
  'flappy',
]
export const rootTheia = 'agoblinking/overworld'

export const PAD_SPEED = 0.5

export const SPONSOR = ['ETHEREUM', 'ETH-QR-CODE', 'GITHUB']

export const USER_SCALE = 100

export function UserUnits(x: number) {
  return x / USER_SCALE
}

export const YGGDRASIL = '/bifrost'
