import { EGravity, EMatter, EPhase } from 'src/buffer/matter'

export interface IMarkers {
  [markerID: number]: string
}

export interface INode {
  data?: number[]
  children: { [key: string]: INode }
}

// easier for humans to read
export interface ITimeline extends INode {
  markers: IMarkers
  flat: { [key: number]: INode }
}

export enum EAxis {
  X,
  Y,
  Z,
  XY,
  YZ,
  XZ,
  XYZ,
}

// Only allows 0.01 precision
export enum EVar {
  NUMBER,
  STRING,
  POSITIVE,
  NEGATIVE,
  // allows for selection of ID by marker name
  TAGID,
  COLOR,
  VEC3,
  SHAPE,
  // think 0 - 1 but like 0 - MAX_SAFE_INTEGER
  NORMAL,
  AXIS,
  AUDIO,
  VOX,
  // -1 0 1
  SIGN,
}

// ETimeline events are reversable transactions that allow for time travel
// WARNING: Safe to add new events to end but not remove/reorder existing ones
export enum ETimeline {
  NONE = 0,
  TAG,
  MUSIC,
  SHAPE,
  COLOR,
  SIZE,
  SIZEVAR,
  REZ,
  DEREZ,
  POS,
  POSTO,
  POSRAND,
  THRUST,
  THRUSTTO,
  THRUSTRAND,
  ROTATION,
  LOOK,
  LOOKTO,

  // When something interesting happens the who
  EVENT,

  // Bind the children's who to another
  BIND,
  MATTER,
  // TODO:
  CONTROL,
  NET,
  AI,
}

export const Commands: { [key: number]: any } = {
  [ETimeline.TAG]: { text: EVar.STRING },
  [ETimeline.SHAPE]: { shape: EVar.SHAPE, count: EVar.POSITIVE },
  [ETimeline.MATTER]: { phase: EPhase, matter: EMatter, gravity: EGravity },
  [ETimeline.COLOR]: {
    rgb: EVar.COLOR,
    tilt: EVar.NUMBER,
    variance: EVar.NORMAL,
  },

  [ETimeline.SIZE]: { x: EVar.POSITIVE, y: EVar.POSITIVE, z: EVar.POSITIVE },
  [ETimeline.MUSIC]: { audio: EVar.AUDIO },
  [ETimeline.SIZEVAR]: {
    x: EVar.POSITIVE,
    y: EVar.POSITIVE,
    z: EVar.POSITIVE,
  },
  [ETimeline.ROTATION]: { xyz: EVar.VEC3 },

  [ETimeline.REZ]: { priority: EVar.NUMBER },
  [ETimeline.DEREZ]: {},

  [ETimeline.POS]: { xyz: EVar.VEC3 },
  [ETimeline.POSRAND]: {
    thrust: EVar.POSITIVE,
    axis: EVar.AXIS,
    constraint: EVar.SIGN,
  },
  [ETimeline.POSTO]: { tag: EVar.TAGID },
  [ETimeline.THRUST]: {
    xyz: EVar.VEC3,
  },
  [ETimeline.THRUSTTO]: {
    tag: EVar.TAGID,
  },
  [ETimeline.THRUSTRAND]: {
    thrust: EVar.POSITIVE,
    axis: EVar.AXIS,
    constraint: EVar.SIGN,
  },

  [ETimeline.LOOK]: { xyz: EVar.VEC3 },
  [ETimeline.LOOKTO]: { tag: EVar.TAGID },
}
