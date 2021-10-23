import { EAnimation } from 'src/buffer/animation'
import { EPhase } from 'src/buffer/phys'
import { ERole } from 'src/buffer/traits'

export enum EWhen {
  NEVER,
  IMMEDIATELY,
  HIT,
  REZ,
}
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

export enum ETomeRipple {
  RIPPLE = 0,
  SINK,
}
export enum ETomeLive {
  LIVE = 0,
  ETHEREAL,
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
  LINE,
  // Sphere,
  // Circle,

  // Wall,
  // Box,
}

export enum EShapePattern {
  NONE = 0,
  EDGES,
  DIAGONAL,
  DIAGONAL_TIGHT,
  DIAGONAL_SLOPPY,
  MISC_BARS,
  DIAGONAL_PLAID,
  WAVES,
  WAVES_TIGHT,
  DIAGONAL_SQUARE,
  MISC_UPVOTE,
  SNAKE,
  SNAKE_CHANNEL,
  DIAGONAL_LOOSE,
  EDGES_BARRED,
  CHECKER,
  CHECKER_TIGHT,
  BRICK,
  BRICK_TIGHT,
  BRICK_TIGHT_ROUND,
  BRICK_SLOPPY,
  BRICK_TIGHT_SLOPPY,
  BRICK_VERTICAL,
  TILE_CIRCLE,
  CANDY_CORN,
  DIAGONAL_WAVE,
  DIAGONAL_WAVE_SLOPPY,
  DIAGONAL_WAVE_TIGHT,
  WAVE,
  WAVE_TIGHT,
  WAVE_PLAID,
  WAVE_INVERT,
  TILE_ORGANIC,
  TILE_DIAGONAL_CIRCUIT,
  STAR_TIGHT,
  CHECKER_TRIANGLES,
  CHECKER_SQUARE_TILT,
  STONE_HEX,
  STONE_ROUND,
  STONE_ROUND_ALT,
  STONE_TILE,
  STONE_LOOSE,
  STONE_DIAGONAL,
  TRIANGLES,
  TRIANGLES_ALT,
  TRIANGLES_TIGHT,
  STAR,
  PIPE_STRIPE,
  CROSS,
  MISC_LAYERED,
  BOARDS,
  DIAMONDS_SLOPPY,
  SQUARES_TILT,
  SQUARES_TILT_ALT,
  SQUARES_TILT_LOOSE,
  SQUARES_SPARSE,
  MISC_PETALS_SPARSE,
  HEX_LOOSE,
  HEX_TIGHT,
  TILE_DISTRIBUTED,
  CROSS_TIGHT,
  DIAMONDS,
  DIAMONDS_LOOSE,
  DIAMONDS_SPARSE,
  MISC_PENTAGON,
  DIAMONDS_TIGHT,
  DIAMONDS_TIGHT_SLOPPY,
  BRICK_SPRASE_SLOPPY,
  BRICK_SPARSE_SLOPPY_ALT,
  CIRCLE_SLOPPY,
  CIRCLE,
  CIRCLE_TIGHT,
  MISC_HONEYCOMB,
  DOTS,
  DOTS_TIGHT,
  TILE_HEARTS,
  TILE_SHIELDS,
  TILE_ORGANIC_TIGHT,
  TILE_DIAMOND,
  WATER,
  WATER_ALT,
  STONE,
  STONE_ALT,
  MISC_ZEBRA,
  TILE_ZIPPER,
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
  NOISE,
  // -1 0 1
  SIGN,
  TIME,
  FAENUMBER,
  FAEPOSITIVE,
  FIVEFINGERS,
  BOOL,
  LONGSTRING,
  SHORTSTRING,
}

export enum ECarriers {
  NONE,
  HAND_LEFT,
  HAND_RIGHT,
  HAND_BETWEEN,
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
  FAE_POS,
  FAE_ROT,
  FAE_SIZE,
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
  FAE_AVATAR,
  VOX_BREAK,
  FLOCK_RECT,
  GAME_SCORE,
  MIDI,
  GAME_STATUS,
  WHEN,
  // free
  TRAP_DISTANCE,
  TRAP_FILTER,
  TRAP_TIME,
  TRAP_CLEAR,
  // end free
  MIDI_INSTRUMENT,
  DO_SEEK,
  UNI_GRAVITY,
  FAE_COLOR,
  MIDI_CHIRP,
  PHYS_CARRIED,
  TOME_OPTIONS,
  NOISE_PASSIVE,
  // soon
  ___IF,
  ___VAR,
  FLOCK_LINE,
  NOISE_HURT,
  NOISE_ACTIVE,
  NOISE_LOVE,
  NOISE_DEATH,
  ATTACH,
  SHAPE_PATTERN,
}

export enum EConstraint {
  FULL = 0,
  NEGATIVE = -1,
  POSITIVE = 1,
}

export const ESpellHelp = {
  [ESpell.TOME]: 'A holder of knowledge',
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
    'SET THE THEIA RULER FOR LOADING FROM GITHUB. MAPS TO GITHUB FAE NAME.',
  [ESpell.THEIA_REALM]: 'SET THE THEIA REALM, MAPS TO FILE NAME WITHOUT .FATE',
  [ESpell.EVENT]: 'An event',
  [ESpell.PHYS_CAGE]: 'Cage atoms to these bounds, also sets realm shader cage',
  [ESpell.PHYS_PHASE]: 'Atomic Phase for physics',
  [ESpell.AI]: 'Atomic AI routine. HUNTER hunts the avatar',
  [ESpell.SHAPE_EFFECTS]: 'Atomic Shader Effects, like NOEFFECTS',
  [ESpell.VOX]:
    'Atomic Voxel Shape. Forms a pattern at the point of a flock based on a .vox file.',
  [ESpell.VOX_VAR]: 'Atomic Voxel Shape Variance of position within the vox',
  [ESpell.FAE_AVATAR]: 'Atomic Fae Avatar designation',
  [ESpell.FAE_POS]: 'Atomic Fae Position',
  [ESpell.FAE_ROT]: 'Atomic Fae Rotation',
  [ESpell.FAE_SIZE]: 'Atomic Fae Size',
  [ESpell.UNI_IDLE]:
    'Atomic Idle routine. IDLE_RANDOMIZE randomizes the idle routine',
  [ESpell.UNI_CLEAR_COLOR]: 'Clear Color',
  [ESpell.DO_SEEK]: 'Seek to a position in the track without causing a reset',
  [ESpell.PHYS_CARRIED]: 'Use the targets position as the base position',
  [ESpell.TOME_OPTIONS]: 'Turn on/off the ripple and live tome options',
  [ESpell.NOISE_PASSIVE]: 'The vibe, beat, jive of the atom',
  [ESpell.___VAR]: 'Set a variable [name] [action] [with]',
  [ESpell.___IF]:
    'If [blah] is [greater|less|equal| to [other blah] do these things',
  [ESpell.FLOCK_LINE]: 'A flock of atoms set in a line',
}

export const Invocations: { [key: number]: any } = {
  [ESpell.TOME]: { text: EVar.STRING },

  [ESpell.PHYS_PHASE]: {
    phase: EPhase,
    tag: EVar.SHORTSTRING,
    tag2: EVar.SHORTSTRING,
  },
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
    x: EVar.FAEPOSITIVE,
    y: EVar.FAEPOSITIVE,
    z: EVar.FAEPOSITIVE,
  },
  //   [ETimeline.MUSIC]: { audio: EVar.AUDIO },
  [ESpell.SHAPE_VAR]: {
    x: EVar.FAEPOSITIVE,
    y: EVar.FAEPOSITIVE,
    z: EVar.FAEPOSITIVE,
  },
  [ESpell.ROT]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },
  [ESpell.ROT_VAR]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },

  [ESpell.DO_REZ]: {
    count: EVar.NUMBER,
  },
  [ESpell.DO_FREE]: {},

  [ESpell.POS]: {
    x: EVar.FAENUMBER,
    y: EVar.FAENUMBER,
    z: EVar.FAENUMBER,
  },
  [ESpell.POS_VAR]: {
    x: EVar.FAENUMBER,
    y: EVar.FAENUMBER,
    z: EVar.FAENUMBER,
  },
  [ESpell.THRUST]: {
    x: EVar.FAENUMBER,
    y: EVar.FAENUMBER,
    z: EVar.FAENUMBER,
  },

  [ESpell.THRUST_VAR]: {
    axis: EAxis,
    thrust: EVar.FAEPOSITIVE,
    constraint: EConstraint,
  },

  [ESpell.ROT_LOOK]: {
    x: EVar.FAENUMBER,
    y: EVar.FAENUMBER,
    z: EVar.FAENUMBER,
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
    min: EVar.FAENUMBER,
    max: EVar.FAENUMBER,
  },

  [ESpell.UNI_IDLE]: { idle: EIdle },
  [ESpell.FAE_POS]: {
    x: EVar.FAENUMBER,
    y: EVar.FAENUMBER,
    z: EVar.FAENUMBER,
  },
  // [ETimeline.FAEROT]: { x: EVar.NUMBER, y: EVar.NUMBER, z: EVar.NUMBER },
  [ESpell.FAE_SIZE]: { size: EVar.FAEPOSITIVE },
  [ESpell.FLOCK_TEXT]: { text: EVar.STRING },
  [ESpell.UNI_CLEAR_COLOR]: { rgb: EVar.COLOR },
  [ESpell.FAE_ROT]: { x: EVar.NORMAL, y: EVar.NORMAL, z: EVar.NORMAL },
  [ESpell.POS_ADD]: {
    x: EVar.FAENUMBER,
    y: EVar.FAENUMBER,
    z: EVar.FAENUMBER,
  },
  [ESpell.THRUST_ADD]: {
    x: EVar.FAENUMBER,
    y: EVar.FAENUMBER,
    z: EVar.FAENUMBER,
  },

  [ESpell.THEIA_RULER]: { githubFae: EVar.STRING },
  [ESpell.THEIA_REALM]: { theia: EVar.STRING },
  [ESpell.THEIA_GATE]: { theia: EVar.STRING },

  [ESpell.FLOCK_RING]: {
    radius: EVar.FAEPOSITIVE,
    count: EVar.POSITIVE,
  },
  [ESpell.FLOCK_GRID]: {
    birds_squared: EVar.POSITIVE,
    margin: EVar.FAEPOSITIVE,
    birds_length_optional: EVar.POSITIVE,
  },

  [ESpell.FAE_AVATAR]: {
    thrustStrength: EVar.FAENUMBER,
  },

  [ESpell.AI]: {
    role: ERole,
  },
  [ESpell.FLOCK_RECT]: {
    x: EVar.POSITIVE,
    z: EVar.POSITIVE,
    margin: EVar.FAEPOSITIVE,
  },

  [ESpell.GAME_SCORE]: {
    score: EVar.NUMBER,
  },

  [ESpell.GAME_STATUS]: {
    game_status: EGameStatus,
  },

  [ESpell.VOX_BREAK]: {
    Percentage: EVar.NORMAL,
  },
  [ESpell.DO_SEEK]: {
    when: EVar.TIME,
  },
  [ESpell.UNI_GRAVITY]: {
    x: EVar.FAENUMBER,
    y: EVar.FAENUMBER,
    z: EVar.FAENUMBER,
  },
  [ESpell.FAE_COLOR]: {
    color: EVar.COLOR,
    hueVariance: EVar.NORMAL,
  },

  // [ESpell.PHYS_CARRIED]: {
  //   whom: ECarriers,
  // },
  [ESpell.TOME_OPTIONS]: {
    ripple: ETomeRipple,
    liveliness: ETomeLive,
  },
  // [ESpell.NOISE_PASSIVE]: {
  //   noise: EVar.NOISE,
  // },
  [ESpell.FLOCK_LINE]: {
    count: EVar.POSITIVE,
    spacing: EVar.FAEPOSITIVE,
    direction: EAxis,
  },
  // [ESpell.WHEN]: {
  //   when: EWhen,
  //   cooldown: EVar.TIME,
  //   filter_by_tag: EVar.STRING,
  // },
  // [ESpell.ATTACH]: {
  //   when: EWhen,
  //   cooldown: EVar.TIME,
  //   filter_by_tag: EVar.STRING,
  // },
  [ESpell.SHAPE_PATTERN]: {
    pattern: EShapePattern,
  },
}
