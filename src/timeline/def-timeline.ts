import { EAnimation } from 'src/buffer/animation'
import { EPhase } from 'src/buffer/matter'

export interface IMarkers {
  [markerID: number]: string
}

export interface INode {
  $?: number[]
  _: { [key: string]: INode }
}

// easier for humans to read
export interface ITimeline extends INode {
  markers: IMarkers
  flat: { [key: number]: INode }
}

export enum EImpactReaction {
  None = 0,
  Destroy,
  Bounce,
  DestroyOther,
  DestroyBoth,
  Respawn,
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
  VOX,
  // think 0 - 1 but like 0 - MAX_SAFE_INTEGER
  NORMAL,
  AUDIO,
  // -1 0 1
  SIGN,
  TIME,
  USERNUMBER,
  USERPOSITIVE,
}

export enum EIdle {
  Randomize,
  None,
}

// ETimeline events are reversable transactions that allow for time travel
// WARNING: Safe to add new events to end but not remove/reorder existing ones
export enum ETimeline {
  NONE = 0,
  TAG,
  MUSIC,
  FLOCK,
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

  // Cage this physics item to these bounds
  CAGE,
  PHASE,
  // TODO:
  CONTROL,
  NET,
  AI,
  EFFECTS,
  VOX,
  ROTVAR,
  IMPACT,
  VOXVAR,
  USERPOS,
  USERROT,
  USERSIZE,
  IDLE,
  TEXT,
  CLEARCOLOR,
}

export const Commands: { [key: number]: any } = {
  [ETimeline.TAG]: { text: EVar.STRING },
  [ETimeline.FLOCK]: {
    shape: EShape,
    size: EVar.POSITIVE,
    step: EVar.USERPOSITIVE,
  },
  [ETimeline.PHASE]: { phase: EPhase },
  [ETimeline.COLOR]: {
    rgb: EVar.COLOR,
    tilt: EVar.NORMAL,
    variance: EVar.NORMAL,
  },
  [ETimeline.VOXVAR]: {
    rgb: EVar.COLOR,
    tilt: EVar.NORMAL,
    variance: EVar.NORMAL,
  },
  [ETimeline.SIZE]: {
    x: EVar.USERPOSITIVE,
    y: EVar.USERPOSITIVE,
    z: EVar.USERPOSITIVE,
  },
  //   [ETimeline.MUSIC]: { audio: EVar.AUDIO },
  [ETimeline.SIZEVAR]: {
    x: EVar.USERPOSITIVE,
    y: EVar.USERPOSITIVE,
    z: EVar.USERPOSITIVE,
  },
  [ETimeline.ROT]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },
  [ETimeline.ROTVAR]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },

  [ETimeline.REZ]: {
    count: EVar.NUMBER,
  },
  [ETimeline.DEREZ]: {},

  [ETimeline.POS]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  [ETimeline.POSVAR]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  [ETimeline.THRUST]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },

  [ETimeline.THRUSTVAR]: {
    axis: EAxis,
    thrust: EVar.USERPOSITIVE,
    constraint: EVar.SIGN,
  },

  [ETimeline.LOOK]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  // [ETimeline.POSTO]: { tag: EVar.TAGID },
  // [ETimeline.LOOKTO]: { tag: EVar.TAGID },
  // [ETimeline.THRUSTTO]: {
  //     tag: EVar.TAGID,
  // },
  [ETimeline.EFFECTS]: { animation: EAnimation },
  [ETimeline.VOX]: { 'Vox Model': EVar.VOX },
  [ETimeline.IMPACT]: { reaction: EImpactReaction },
  [ETimeline.CAGE]: { axis: EAxis, min: EVar.USERNUMBER, max: EVar.USERNUMBER },

  [ETimeline.IDLE]: { idle: EIdle },
  [ETimeline.USERPOS]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  // [ETimeline.USERROT]: { x: EVar.NUMBER, y: EVar.NUMBER, z: EVar.NUMBER },
  [ETimeline.USERSIZE]: { size: EVar.USERPOSITIVE },
  [ETimeline.TEXT]: { text: EVar.STRING },
  [ETimeline.CLEARCOLOR]: { rgb: EVar.COLOR },
  [ETimeline.USERROT]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },
}
