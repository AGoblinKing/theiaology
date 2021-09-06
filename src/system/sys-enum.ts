// Positives are used to refer to entity IDs
// Negatives for messages

export enum EMessage {
  REZ = -1,
  FREE_ALL = -404,
  TIMELINE_UPDATE = -2000,
  CLEAR_COLOR_UPDATE = -2002,
  USER_POS_UPDATE = -2003,
  USER_ROT_UPDATE = -2004,
  LAND_ADD = -5001,
  LAND_REMOVE = -5002,
}

export type FRez = () => number

export enum EMultiplayer {
  LOBBY_HOST = 'LOBBY_HOST',
  SECRET_HOST = 'SECRET_HOST',
  LOBBY_JOIN = 'LOBBY_JOIN',
  SECRET_JOIN = 'SECRET_JOIN',
}
