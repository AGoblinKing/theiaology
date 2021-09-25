// Positives are used to refer to entity IDs
// Negatives for messages

import { Animation } from 'src/buffer/animation'
import { Cage } from 'src/buffer/cage'
import { Fate } from 'src/buffer/fate'
import { Impact } from 'src/buffer/impact'
import { Matter } from 'src/buffer/matter'
import { Phys } from 'src/buffer/phys'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Thrust } from 'src/buffer/thrust'
import { Traits } from 'src/buffer/traits'
import { Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'

export enum EMessage {
  REZ = -1,
  FREE_ALL = -404,
  UNI_SCORE = -1000,
  FATE_UPDATE = -2000,
  CLEAR_COLOR_UPDATE = -2002,
  USER_POS_UPDATE = -2003,
  USER_ROT_UPDATE = -2004,
  LAND_ADD = -5001,
  LAND_REMOVE = -5002,
  PHYS_TICK = -6000,
  CARD_TICK = -7000,
  CARD_AVATAR = -7001,
  CARD_MIDI = -7002,
  CARD_SEEK = -7003,
  CARD_SEEKED = -7004,
  YGG_REALM_UPDATE = -8000,
  YGG_HOST = -8001,
  YGG_JOIN = -8002,
}

export type FRez = () => number

export interface ICardinal {
  // entity components
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  thrust: Thrust
  size: Size
  impact: Impact
  animation: Animation
  traits: Traits
  velocity: Velocity
  phys: Phys

  fate: Fate
  universal: Universal
  cage: Cage

  ready: boolean

  lastTime: number
  clutchFate: boolean

  free(i: number)
  post(message: any)
}
