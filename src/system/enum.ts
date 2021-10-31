// Positives are used to refer to entity IDs
// Negatives for messages

import { Animation } from 'src/buffer/animation'
import { Cage } from 'src/buffer/cage'
import { Fate } from 'src/buffer/fate'
import { Impact } from 'src/buffer/impact'
import { Matter } from 'src/buffer/matter'
import { Noise } from 'src/buffer/noise'
import { Phys } from 'src/buffer/phys'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Thrust } from 'src/buffer/thrust'
import { Traits } from 'src/buffer/traits'
import { Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ESelectThen } from 'src/fate/weave'
import { MagickaVoxel } from 'src/magica'
import { Value } from 'src/value'

export enum EMessage {
  REZ = -1,
  FREE_ALL = -404,
  UNI_SCORE = -1000,
  FATE_UPDATE = -2000,
  CLEAR_COLOR_UPDATE = -2002,
  FAE_POS_UPDATE = -2003,
  FAE_ROT_UPDATE = -2004,
  FAE_NOTIFY = -2005,
  PHYS_COLLIDE = -3000,
  SNS_UPDATE = -4000,
  LAND_ADD = -5001,
  LAND_REMOVE = -5002,
  PHYS_TICK = -6000,
  PHYS_SELECT = -6001,
  CARD_TICK = -7000,
  CARD_AVATAR = -7001,
  CARD_MIDI = -7002,
  CARD_SEEK = -7003,
  CARD_SEEKED = -7004,
  CARD_MIDI_CHIRP = -7005,
  // Load the specified file
  CARD_LOAD = -7006,
  YGG_REALM_UPDATE = -8000,
  YGG_HOST = -8001,
  YGG_JOIN = -8002,
}

export enum ENotifyPosition {
  BETWEEN_HANDS = 0,
  LEFT_HAND,
  RIGHT_HAND,
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
  noise: Noise

  fate: Fate
  universal: Universal
  cage: Cage

  ready: boolean

  lastTime: number
  clutchFate: boolean

  voxes: Value<{ [name: string]: MagickaVoxel }>

  free(i: number)
  post(message: any)
  reserve(): number
}

export interface IPhysSelect {
  min: { x: number; y: number; z: number }
  max: { x: number; y: number; z: number }
  message: EMessage.PHYS_SELECT
  do: ESelectThen
  is: string
  not: string
}
