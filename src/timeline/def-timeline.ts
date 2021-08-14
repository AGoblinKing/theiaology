import { EAnimation } from 'src/buffer/animation'
import { EPhase } from 'src/buffer/matter'
import { Color, Euler, Vector3 } from 'three'

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
  rot = new Euler()
  rotvar = new Euler()
  size = new Vector3()
  col = { tilt: 0, variance: 0 }
  vox = ''
  sizevar = new Vector3()
  posvar = new Vector3()
  flock: { shape: EShape; size: number; step: number }
  look = new Vector3()

  doLook = false

  reset() {
    this.color.setRGB(1, 1, 1)
    this.pos.set(0, 0, 0)
    this.rot.set(0, 0, 0)
    this.rotvar.set(0, 0, 0)
    this.size.set(1, 1, 1)
    this.vox = ''
    this.col.tilt = 0
    this.col.variance = 0

    this.sizevar.set(0, 0, 0)
    this.look.set(0, 0, 0)

    this.posvar.set(0, 0, 0)
    this.flock = { shape: EShape.Box, size: 1, step: 0 }
    this.doLook = false
  }
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
  IMPACT,
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
  [ETimeline.ROT]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },
  [ETimeline.ROTVAR]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },

  [ETimeline.REZ]: {
    count: EVar.NUMBER,
  },
  [ETimeline.DEREZ]: {},

  [ETimeline.POS]: { x: EVar.NUMBER, y: EVar.NUMBER, z: EVar.NUMBER },
  [ETimeline.POSVAR]: {
    x: EVar.NUMBER,
    y: EVar.NUMBER,
    z: EVar.NUMBER,
  },
  [ETimeline.THRUST]: {
    x: EVar.NUMBER,
    y: EVar.NUMBER,
    z: EVar.NUMBER,
  },

  [ETimeline.THRUSTVAR]: {
    thrust: EVar.POSITIVE,
    axis: EAxis,
    constraint: EVar.SIGN,
  },

  [ETimeline.LOOK]: { x: EVar.NUMBER, y: EVar.NUMBER, z: EVar.NUMBER },
  // [ETimeline.POSTO]: { tag: EVar.TAGID },
  // [ETimeline.LOOKTO]: { tag: EVar.TAGID },
  // [ETimeline.THRUSTTO]: {
  //     tag: EVar.TAGID,
  // },
  [ETimeline.EFFECTS]: { animation: EAnimation },
  [ETimeline.VOX]: { 'Vox Model': EVar.VOX },
  [ETimeline.IMPACT]: { reaction: EImpactReaction },
}
