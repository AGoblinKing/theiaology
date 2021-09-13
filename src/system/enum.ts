// Positives are used to refer to entity IDs
// Negatives for messages

export enum EMessage {
  REZ = -1,
  FREE_ALL = -404,
  FATE_UPDATE = -2000,
  CLEAR_COLOR_UPDATE = -2002,
  USER_POS_UPDATE = -2003,
  USER_ROT_UPDATE = -2004,
  LAND_ADD = -5001,
  LAND_REMOVE = -5002,
  PHYSICS_TICK = -6000,
  CARDINAL_TICK = -7000,
}

export type FRez = () => number