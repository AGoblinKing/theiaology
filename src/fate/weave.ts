import { EAnimation } from 'src/buffer/animation'
import { EPhase } from 'src/buffer/phys'
import { ERole } from 'src/buffer/traits'
import { EMidiFlourish } from 'src/controller/midi'

export interface IMarkers {
  [markerID: number]: string
}

export interface INode {
  $?: number[]
  _: { [key: string]: INode }
}

// easier for humans to read
export interface IFate extends INode {
  markers: IMarkers
  flat: { [key: number]: INode }
}

export enum EImpactReaction {
  NONE = 0,
  DESTROY,
  BOUNCE,
  DESTROY_OTHER,
  DESTROY_BOTH,
  RESPAWN,
}

export enum EShape {
  PLANE,
  RING,
  RECT,
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
  BOOL,
}

export enum EIdle {
  RANDOMIZE,
  NONE,
}

export enum EGameStatus {
  NOT_STARTED,
  INIT,
  PLAYING,
  WIN,
  LOST,
  DRAW,
  END,
}

// ETimeline events are reversable transactions that allow for time travel
// WARNING: Safe to add new events to end but not remove/reorder existing ones
export enum ESpell {
  NONE = 0,
  TOME,
  // unused
  MUSIC,
  // deprecated
  FLOCK,
  SHAPE_COLOR,
  SHAPE,
  SHAPE_VAR,
  DO_REZ,
  DO_FREE,
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
  VOX,
  ROT_VAR,
  IMPACT,
  VOX_VAR,
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
  USER_AVATAR,
  VOX_BREAK,
  FLOCK_RECT,
  DO_SCORE,
  DO_MIDI,
  DO_STATUS,
  TRAP_IMPACT,
  TRAP_DISTANCE,
  TRAP_FILTER,
  TRAP_TIME,
  TRAP_CLEAR,
  MIDI_INSTRUMENT,
}

export enum EConstraint {
  FULL = 0,
  NEGATIVE = -1,
  POSITIVE = 1,
}

export const ESpellHelp = {
  [ESpell.TOME]: 'A holder of knowledge',
  [ESpell.MUSIC]: 'A song',
  [ESpell.FLOCK_GRID]: 'A flock of atoms set in a uniform grid',
  [ESpell.FLOCK_RING]: 'A flock of atoms set in a ring',
  [ESpell.FLOCK_TEXT]: 'A flock of atoms set as text',

  [ESpell.SHAPE_COLOR]: 'Atomic color',
  [ESpell.SHAPE]: 'Atomic Shape/Size',
  [ESpell.SHAPE_VAR]: 'Atomic Shape/Size Variance',
  [ESpell.DO_REZ]: 'Rez a Tome',
  [ESpell.DO_FREE]: 'Free all atoms in rezzed by this Tome',
  [ESpell.POS]: 'Atomic Position',
  [ESpell.POS_TO]: 'Atomic Position to',
  [ESpell.POS_VAR]: 'Atomic Position Variance',
  [ESpell.THRUST]: 'Atomic Thrust',
  [ESpell.THRUST_TO]: 'Atomic Thrust to',
  [ESpell.THRUST_VAR]: 'Atomic Thrust Variance',
  [ESpell.ROT]: 'Atomic Rotation',
  [ESpell.ROT_LOOK]: 'Atomic Rotation to look at',
  [ESpell.ROT_LOOK_TO]: 'Atomic Rotation to look at to',
  [ESpell.ROT_VAR]: 'Atomic Rotation Variance',
  [ESpell.THEIA_RULER]:
    'SET THE THEIA RULER FOR LOADING FROM GITHUB. MAPS TO GITHUB USER NAME.',
  [ESpell.THEIA_REALM]: 'SET THE THEIA REALM, MAPS TO FILE NAME WITHOUT .FATE',
  [ESpell.EVENT]: 'An event',
  [ESpell.PHYS_CAGE]: 'Cage atoms to these bounds, also sets realm shader cage',
  [ESpell.PHYS_PHASE]: 'Atomic Phase for physics',
  [ESpell.AI]: 'Atomic AI routine. HUNTER hunts the avatar',
  [ESpell.SHAPE_EFFECTS]: 'Atomic Shader Effects, like NOEFFECTS',
  [ESpell.VOX]:
    'Atomic Voxel Shape. Forms a pattern at the point of a flock based on a .vox file.',
  [ESpell.VOX_VAR]: 'Atomic Voxel Shape Variance of position within the vox',
  [ESpell.USER_AVATAR]: 'Atomic User Avatar designation',
  [ESpell.USER_POS]: 'Atomic User Position',
  [ESpell.USER_ROT]: 'Atomic User Rotation',
  [ESpell.USER_SIZE]: 'Atomic User Size',
  [ESpell.UNI_IDLE]:
    'Atomic Idle routine. IDLE_RANDOMIZE randomizes the idle routine',
  [ESpell.UNI_CLEAR_COLOR]: 'Clear Color',
}

export const Invocations: { [key: number]: any } = {
  [ESpell.TOME]: { text: EVar.STRING },

  [ESpell.PHYS_PHASE]: { phase: EPhase },
  [ESpell.SHAPE_COLOR]: {
    rgb: EVar.COLOR,
    tilt: EVar.NORMAL,
    variance: EVar.NORMAL,
  },
  [ESpell.VOX_VAR]: {
    rgb: EVar.COLOR,
    tilt: EVar.NORMAL,
    variance: EVar.NORMAL,
  },
  [ESpell.SHAPE]: {
    x: EVar.USERPOSITIVE,
    y: EVar.USERPOSITIVE,
    z: EVar.USERPOSITIVE,
  },
  //   [ETimeline.MUSIC]: { audio: EVar.AUDIO },
  [ESpell.SHAPE_VAR]: {
    x: EVar.USERPOSITIVE,
    y: EVar.USERPOSITIVE,
    z: EVar.USERPOSITIVE,
  },
  [ESpell.ROT]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },
  [ESpell.ROT_VAR]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },

  [ESpell.DO_REZ]: {
    count: EVar.NUMBER,
  },
  [ESpell.DO_FREE]: {},

  [ESpell.POS]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  [ESpell.POS_VAR]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  [ESpell.THRUST]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },

  [ESpell.THRUST_VAR]: {
    axis: EAxis,
    thrust: EVar.USERPOSITIVE,
    constraint: EConstraint,
  },

  [ESpell.ROT_LOOK]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  // [ETimeline.POSTO]: { tag: EVar.TAGID },
  // [ETimeline.LOOKTO]: { tag: EVar.TAGID },
  // [ETimeline.THRUSTTO]: {
  //     tag: EVar.TAGID,
  // },
  [ESpell.SHAPE_EFFECTS]: { animation: EAnimation },
  [ESpell.VOX]: { 'Vox Model': EVar.VOX },
  // [ETimeline.IMPACT]: { reaction: EImpactReaction },
  [ESpell.PHYS_CAGE]: {
    axis: EAxis,
    min: EVar.USERNUMBER,
    max: EVar.USERNUMBER,
  },

  [ESpell.UNI_IDLE]: { idle: EIdle },
  [ESpell.USER_POS]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  // [ETimeline.USERROT]: { x: EVar.NUMBER, y: EVar.NUMBER, z: EVar.NUMBER },
  [ESpell.USER_SIZE]: { size: EVar.USERPOSITIVE },
  [ESpell.FLOCK_TEXT]: { text: EVar.STRING },
  [ESpell.UNI_CLEAR_COLOR]: { rgb: EVar.COLOR },
  [ESpell.USER_ROT]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },
  [ESpell.POS_ADD]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },
  [ESpell.THRUST_ADD]: {
    x: EVar.USERNUMBER,
    y: EVar.USERNUMBER,
    z: EVar.USERNUMBER,
  },

  [ESpell.THEIA_RULER]: { githubUser: EVar.STRING },
  [ESpell.THEIA_REALM]: { theia: EVar.STRING },
  [ESpell.THEIA_GATE]: { theia: EVar.STRING },
  [ESpell.DO_MIDI]: {
    note: EVar.POSITIVE,
    flourish: EMidiFlourish,
    timing: EVar.USERPOSITIVE,
  },

  [ESpell.MIDI_INSTRUMENT]: {
    instrument: EVar.NUMBER,
    volume: EVar.NORMAL,
    pan: EVar.NORMAL,
  },

  [ESpell.FLOCK_RING]: {
    radius: EVar.USERPOSITIVE,
    count: EVar.POSITIVE,
  },
  [ESpell.FLOCK_GRID]: {
    birds_squared: EVar.POSITIVE,
    margin: EVar.USERPOSITIVE,
  },

  [ESpell.USER_AVATAR]: {
    thrustStrength: EVar.USERNUMBER,
  },

  [ESpell.AI]: {
    role: ERole,
  },
  [ESpell.FLOCK_RECT]: {
    x: EVar.POSITIVE,
    z: EVar.POSITIVE,
    margin: EVar.USERPOSITIVE,
  },

  [ESpell.DO_SCORE]: {
    score: EVar.NUMBER,
  },

  [ESpell.DO_STATUS]: {
    game_status: EGameStatus,
  },
  [ESpell.TRAP_IMPACT]: {
    prefix_whom: EVar.STRING,
  },
  [ESpell.TRAP_FILTER]: {
    prefix: EVar.STRING,
  },
  [ESpell.TRAP_DISTANCE]: {
    near: EVar.USERPOSITIVE,
    far: EVar.USERPOSITIVE,
    margin: EVar.USERPOSITIVE,
  },
  [ESpell.TRAP_TIME]: {
    timeout: EVar.USERPOSITIVE,
    repeat: EVar.BOOL,
  },
  [ESpell.TRAP_CLEAR]: {},
}
