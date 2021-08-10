import { EAnimation } from 'src/buffer/animation'
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

export enum EShape {
  Plane,
  Sphere,
  Circle,

  Wall,
  Box,
  Ring,
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
  TAG,
  COLOR,
  VEC3,
  VOX,
  // think 0 - 1 but like 0 - MAX_SAFE_INTEGER
  NORMAL,
  AUDIO,
  // -1 0 1
  SIGN,
  TIME,
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
  POSVAR,
  THRUST,
  THRUSTTO,
  THRUSTVAR,
  ROT,
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
  EFFECTS,
  VOX,
  ROTVAR,
}

export const Commands: { [key: number]: any } = {
  [ETimeline.TAG]: { text: EVar.STRING },
  [ETimeline.SHAPE]: {
    shape: EShape,
    size: EVar.POSITIVE,
    step: EVar.POSITIVE,
  },
  [ETimeline.MATTER]: { phase: EPhase, matter: EMatter, gravity: EGravity },
  [ETimeline.COLOR]: {
    rgb: EVar.COLOR,
    tilt: EVar.NORMAL,
    variance: EVar.NORMAL,
  },

  [ETimeline.SIZE]: { x: EVar.POSITIVE, y: EVar.POSITIVE, z: EVar.POSITIVE },
  //   [ETimeline.MUSIC]: { audio: EVar.AUDIO },
  [ETimeline.SIZEVAR]: {
    x: EVar.POSITIVE,
    y: EVar.POSITIVE,
    z: EVar.POSITIVE,
  },
  [ETimeline.ROT]: { xyz: EVar.VEC3 },
  [ETimeline.ROTVAR]: { xyz: EVar.VEC3 },

  [ETimeline.REZ]: {
    count: EVar.NUMBER,
    'Shape Start': EVar.POSITIVE,
  },
  [ETimeline.DEREZ]: {},

  [ETimeline.POS]: { xyz: EVar.VEC3 },
  [ETimeline.POSVAR]: {
    xyz: EVar.VEC3,
  },
  [ETimeline.THRUST]: {
    xyz: EVar.VEC3,
  },

  [ETimeline.THRUSTVAR]: {
    thrust: EVar.POSITIVE,
    axis: EAxis,
    constraint: EVar.SIGN,
  },

  [ETimeline.LOOK]: { xyz: EVar.VEC3 },
  // [ETimeline.POSTO]: { tag: EVar.TAGID },
  // [ETimeline.LOOKTO]: { tag: EVar.TAGID },
  // [ETimeline.THRUSTTO]: {
  //     tag: EVar.TAGID,
  // },
  [ETimeline.EFFECTS]: { animation: EAnimation },
  [ETimeline.VOX]: { 'Vox Model': EVar.VOX },
}
