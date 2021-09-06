import { EAnimation } from 'src/buffer/animation'
import { EPhase } from 'src/buffer/matter'
import { EMidiChannel } from 'src/sound/midi'

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
  Ring,
  // Sphere,
  // Circle,

  // Wall,
  // Box,
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
  TOME,
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
  FIVEFINGERS,
}

export enum EIdle {
  Randomize,
  None,
}

// ETimeline events are reversable transactions that allow for time travel
// WARNING: Safe to add new events to end but not remove/reorder existing ones
export enum ETimeline {
  NONE = 0,
  TOME,
  MUSIC,
  FLOCK,
  SHAPE_COLOR,
  SHAPE,
  SHAPE_VAR,
  REZ,
  REZ_FREE,
  POS,
  POS_TO,
  POS_VAR,
  THRUST,
  THRUST_TO,
  THRUST_VAR,
  ROT,
  ROT_LOOK,
  ROT_LOOK_TO,

  // When something interesting happens the who
  EVENT,

  // Cage this physics item to these bounds
  PHYS_CAGE,
  PHYS_PHASE,
  // TODO:
  CONTROL,
  NET,
  AI,
  SHAPE_EFFECTS,
  SHAPE_VOX,
  ROT_VAR,
  IMPACT,
  SHAPE_VOX_VAR,
  USER_POS,
  USER_ROT,
  USER_SIZE,
  UNI_IDLE,
  FLOCK_TEXT,
  UNI_CLEAR_COLOR,
  POS_ADD,
  THRUST_ADD,
  THEIA_REALM,
  THEIA_GATE,
  THEIA_RULER,
  SOUND_MIDI,
  SOUND,
  SOUND_POS,
  REZ_POSE,
  TRIGGER,
  FLOCK_RING,
  FLOCK_GRID,
}

export enum EConstraint {
  FULL = 0,
  NEGATIVE = -1,
  POSITIVE = 1,
}

export const Invocations: { [key: number]: any } = {
  [ETimeline.TOME]: { text: EVar.STRING },

  [ETimeline.PHYS_PHASE]: { phase: EPhase },
  [ETimeline.SHAPE_COLOR]: {
    rgb: EVar.COLOR,
    tilt: EVar.NORMAL,
    variance: EVar.NORMAL,
  },
  [ETimeline.SHAPE_VOX_VAR]: {
    rgb: EVar.COLOR,
    tilt: EVar.NORMAL,
    variance: EVar.NORMAL,
  },
  [ETimeline.SHAPE]: {
    x: EVar.USERPOSITIVE,
    y: EVar.USERPOSITIVE,
    z: EVar.USERPOSITIVE,
  },
  //   [ETimeline.MUSIC]: { audio: EVar.AUDIO },
  [ETimeline.SHAPE_VAR]: {
    x: EVar.USERPOSITIVE,
    y: EVar.USERPOSITIVE,
    z: EVar.USERPOSITIVE,
  },
  [ETimeline.ROT]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },
  [ETimeline.ROT_VAR]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },

  [ETimeline.REZ]: {
    count: EVar.NUMBER,
  },
  [ETimeline.REZ_FREE]: {},

  [ETimeline.POS]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  [ETimeline.POS_VAR]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  [ETimeline.THRUST]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },

  [ETimeline.THRUST_VAR]: {
    axis: EAxis,
    thrust: EVar.USERPOSITIVE,
    constraint: EConstraint,
  },

  [ETimeline.ROT_LOOK]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  // [ETimeline.POSTO]: { tag: EVar.TAGID },
  // [ETimeline.LOOKTO]: { tag: EVar.TAGID },
  // [ETimeline.THRUSTTO]: {
  //     tag: EVar.TAGID,
  // },
  [ETimeline.SHAPE_EFFECTS]: { animation: EAnimation },
  [ETimeline.SHAPE_VOX]: { 'Vox Model': EVar.VOX },
  // [ETimeline.IMPACT]: { reaction: EImpactReaction },
  [ETimeline.PHYS_CAGE]: {
    axis: EAxis,
    min: EVar.USERNUMBER,
    max: EVar.USERNUMBER,
  },

  [ETimeline.UNI_IDLE]: { idle: EIdle },
  [ETimeline.USER_POS]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  // [ETimeline.USERROT]: { x: EVar.NUMBER, y: EVar.NUMBER, z: EVar.NUMBER },
  [ETimeline.USER_SIZE]: { size: EVar.USERPOSITIVE },
  [ETimeline.FLOCK_TEXT]: { text: EVar.STRING },
  [ETimeline.UNI_CLEAR_COLOR]: { rgb: EVar.COLOR },
  [ETimeline.USER_ROT]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },
  [ETimeline.POS_ADD]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  [ETimeline.THRUST_ADD]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },

  [ETimeline.THEIA_RULER]: { githubUser: EVar.STRING },
  [ETimeline.THEIA_REALM]: { theia: EVar.STRING },
  [ETimeline.THEIA_GATE]: { theia: EVar.STRING },
  [ETimeline.SOUND_MIDI]: {
    instrument: EMidiChannel,
    note: EVar.POSITIVE,
    velocity: EVar.NORMAL,
  },
  [ETimeline.SOUND]: {
    duration: EVar.NORMAL,
    modulo: EVar.POSITIVE,
    step: EVar.POSITIVE,
  },
  [ETimeline.SOUND_POS]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  // like a triggered rez by hand
  [ETimeline.REZ_POSE]: {
    // hand data
    hand: EVar.FIVEFINGERS,
  },
  [ETimeline.FLOCK_RING]: {
    radius: EVar.USERPOSITIVE,
    count: EVar.POSITIVE,
  },
  [ETimeline.FLOCK_GRID]: {
    birds_squared: EVar.POSITIVE,
    margin: EVar.USERPOSITIVE,
  },
}
