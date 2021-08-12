import { EAnimation } from 'src/buffer/animation'
import { EPhase } from 'src/buffer/matter'
import { Color, Vector3 } from 'three'

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

export class Rez {
  color = new Color()
  pos = new Vector3()
  rot = new Vector3()
  size = new Vector3()
  col = { tilt: 0, variance: 0 }
  vox = ''
  sizevar = new Vector3()
  posvar = new Vector3()
  flock: { shape: EShape; size: number; step: number }

  reset() {
    this.color.setRGB(1, 1, 1)
    this.pos.set(0, 0, 0)
    this.rot.set(0, 0, 0)
    this.size.set(1, 1, 1)
    this.vox = ''
    this.col.tilt = 0
    this.col.variance = 0

    this.sizevar.set(0, 0, 0)
    this.posvar.set(0, 0, 0)
    this.flock = { shape: EShape.Box, size: 1, step: 0 }
  }
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
  [ETimeline.FLOCK]: {
    shape: EShape,
    size: EVar.POSITIVE,
    step: EVar.POSITIVE,
  },
  [ETimeline.MATTER]: { phase: EPhase },
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
