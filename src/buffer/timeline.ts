import { AtomicInt } from 'src/atomic'
import { TIMELINE_MAX } from 'src/config'

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
  Number,
  String,
  Positive,
  Negative,
  TimelineID,
  // allows for selection of ID by marker name
  MarkerID,
  Color,
  FlockID,
  RezID,
  Position,
  Shape,
  // think 0 - 1 but like 0 - MAX_SAFE_INTEGER
  Normal,
  Axis,
  Audio,
  Vox,
}

// ETimeline events are reversable transactions that allow for time travel
// WARNING: Safe to add new events to end but not remove/reorder existing ones
export enum ETimeline {
  None = 0,
  Define,
  Music,
  Flock,
  Shape,
  Color,
  Scale,
  ScaleVariance,
  Rotation,
  Rez,
  DeRez,
  Interval,
  StopInterval,
  MoveToPosition,
  MoveToFlock,
  ApplyVelocity,
  ApplyRandomVelocity,
  LookAtPosition,
  LookAtFlock,
  // Copy's a markers or flocks children's effects
  Copy,
  // When something interesting happens the who
  Event,

  // Bind the children's who to another
  Bind,
  // TODO: save state and load states, useful if they want to place/spawn a bunch of things like a traditional scene
  Snapshot,
  SnapshotLoad,
}

export const Commands: { [key: number]: any } = {
  [ETimeline.Define]: { text: EVar.String },
  [ETimeline.Music]: { audio: EVar.Audio },
  [ETimeline.Flock]: { shape: EVar.Shape, count: EVar.Positive },

  [ETimeline.Color]: {
    rgb: EVar.Color,
    tilt: EVar.Number,
    variance: EVar.Normal,
  },

  [ETimeline.Shape]: { shape: EVar.Shape },
  [ETimeline.Scale]: { x: EVar.Positive, y: EVar.Positive, z: EVar.Positive },
  [ETimeline.ScaleVariance]: {
    x: EVar.Positive,
    y: EVar.Positive,
    z: EVar.Positive,
  },
  [ETimeline.Rotation]: { x: EVar.Number, y: EVar.Number, z: EVar.Number },

  [ETimeline.Rez]: { xyz: EVar.Position },
  [ETimeline.DeRez]: {},
  [ETimeline.Copy]: { text: EVar.String },
  [ETimeline.Interval]: {
    seconds: EVar.Positive,
    start: EVar.TimelineID,
    end: EVar.Positive,
  },

  [ETimeline.StopInterval]: {},
  [ETimeline.MoveToPosition]: { xyz: EVar.Position },
  [ETimeline.MoveToFlock]: { flock: EVar.FlockID },
  [ETimeline.ApplyVelocity]: { x: EVar.Number, y: EVar.Number, z: EVar.Number },

  [ETimeline.ApplyRandomVelocity]: { thrust: EVar.Positive, axis: EVar.Axis },

  [ETimeline.LookAtPosition]: { xyz: EVar.Position },
  [ETimeline.LookAtFlock]: { flock: EVar.FlockID },
}

const strConvertBuffer = new ArrayBuffer(4) // an Int32 takes 4 bytes
const strView = new DataView(strConvertBuffer)

function CharCode(code: number) {
  switch (code) {
    case 0:
      return ''
    default:
      return String.fromCharCode(code)
  }
}
// Authoring Buffer - Generally shouldn't be updating the timeline unless during development
export class Timeline extends AtomicInt {
  static COUNT = 6
  available: number[]

  // expandable
  constructor(sab = new SharedArrayBuffer(Timeline.COUNT * 4 * TIMELINE_MAX)) {
    super(sab)
    // reset available
    this.available = [...new Array(TIMELINE_MAX)].map((_, i) => i)
    // never 0
    this.reserve()
  }

  copy(arr: ArrayBuffer) {
    this.freeAll()
    this.resetAvailable()

    const v = new DataView(arr)

    for (
      let i = 0;
      i < Math.min(arr.byteLength / 4, this.sab.byteLength / 4);
      i++
    ) {
      const val = v.getInt32(i * 4, true)

      if (i < 10) console.log(i, val)
      if (i % Timeline.COUNT === 0 && val !== 0) {
        this.available.splice(this.available.indexOf(i / Timeline.COUNT), 1)
      }
      this.store(i, val)
    }
  }
  // rip through array and create a tree
  toObject(): ITimeline {
    // cache markers by number

    const root = {
      flat: {},
      markers: {},
      data: [],
      children: {},
    }

    for (let i = 1; i < TIMELINE_MAX; i++) {
      const com = this.command(i)

      // next, the others could be anywhere
      if (com === ETimeline.None) continue

      // assume root unless who is specified
      const who = this.who(i)

      let cursor
      switch (true) {
        case who === 0:
          cursor = root
          break

        case root.flat[who] !== undefined:
          cursor = root.flat[who]
          break

        default:
          root.flat[who] = cursor = {
            children: {},
          }
      }

      switch (com) {
        case ETimeline.Define:
          root.markers[i] = this.define(i)

        // fall through
        default:
          if (!root.flat[i]) {
            root.flat[i] = {
              children: {},
            }
          }

          root.flat[i].data = [
            this.when(i),
            com,
            who,
            this.data1(i),
            this.data2(i),
            this.data3(i),
          ]

          cursor.children[i] = root.flat[i]
      }
    }

    return root
  }

  fromObject(obj: ITimeline) {
    throw new Error('Not Implemented')
  }

  toJSON(): string {
    return JSON.stringify(this.toObject())
  }

  // rip through and return a sorted array of the events
  toArray() {
    const res = [[]]
    // 1 is for control
    for (let i = 1; i < this.length; i++) {
      const w = this.command(i)

      // by using the buffer in order we can look to see if we can early exit
      if (w === ETimeline.None) break

      res.push([
        this.when(i),
        w,
        this.who(i),
        this.data1(i),
        this.data2(i),
        this.data3(i),
      ])
    }

    return res.sort((e1, e2) => {
      return e1[0] - e2[0]
    })
  }

  fromArray(arr: number[][]) {
    // reset existing
    this.freeAll()

    // always skip 0
    for (let i = 1; i < arr.length; i++) {
      this.add.apply(this, arr[i])
    }

    this.resetAvailable(arr.length)
  }

  resetAvailable(offset: number = 0) {
    // reset available
    this.available = [...new Array(TIMELINE_MAX - offset)].map(
      (_, i) => i + offset
    )
  }

  // freeAll but do not mark them as available
  freeAll() {
    this.available = []
    for (let i = TIMELINE_MAX - 1; i >= 0; i--) {
      this.free(i)
    }
    // always reserve 0
    const r = this.reserve()
    if (r !== 0) {
      throw new Error(`tried to reserve 0, got ${r}`)
    }
  }

  reserve() {
    return this.available.shift()
  }

  free(i: number) {
    super.free(i, Timeline.COUNT)
    this.available.unshift(i)
  }

  add(
    when: number,
    e: ETimeline,
    // identification number, whether timeline ID or
    who: number,
    d1: number = 0,
    d2: number = 0,
    d3: number = 0
  ) {
    if (this.available.length === 0) {
      throw new Error('Timeline full')
    }

    const i = this.available.shift()

    Atomics.store(this, i * Timeline.COUNT, when)
    Atomics.store(this, i * Timeline.COUNT + 1, e)
    Atomics.store(this, i * Timeline.COUNT + 2, who)
    Atomics.store(this, i * Timeline.COUNT + 3, d1)
    Atomics.store(this, i * Timeline.COUNT + 4, d2)
    Atomics.store(this, i * Timeline.COUNT + 5, d3)

    return i
  }

  // markers are special, only strings
  define(i: number, str?: string) {
    if (str === undefined) {
      return [this.data1(i), this.data2(i), this.data3(i)]
        .map((num: number) => {
          strView.setInt32(0, num, false)
          return (
            CharCode(strView.getUint8(0)) +
            CharCode(strView.getUint8(1)) +
            CharCode(strView.getUint8(2)) +
            CharCode(strView.getUint8(3))
          )
        })
        .join('')
    }

    // max 12 chars
    str = str.slice(0, 12)

    for (let si = 0; si < 12; si++) {
      const six = si % 4
      const siy = Math.floor(si / 4)

      if (si < str.length) {
        strView.setUint8(six, str.charCodeAt(si))
      } else {
        strView.setUint8(six, 0)
      }

      // last
      if (six === 3) {
        Atomics.store(
          this,
          i * Timeline.COUNT + 3 + siy,
          strView.getInt32(0, false)
        )
      }
    }

    return str
  }

  // when
  when(i: number, when?: number) {
    return when === undefined
      ? Atomics.load(this, i * Timeline.COUNT)
      : Atomics.store(this, i * Timeline.COUNT, when)
  }

  // what event
  command(i: number, e?: ETimeline) {
    return e === undefined
      ? Atomics.load(this, i * Timeline.COUNT + 1)
      : Atomics.store(this, i * Timeline.COUNT + 1, e)
  }

  // generally used for refering to something
  who(i: number, who?: number) {
    return who === undefined
      ? Atomics.load(this, i * Timeline.COUNT + 2)
      : Atomics.store(this, i * Timeline.COUNT + 2, who)
  }

  data1(i: number, d1?: number) {
    return d1 === undefined
      ? Atomics.load(this, i * Timeline.COUNT + 3)
      : Atomics.store(this, i * Timeline.COUNT + 3, d1)
  }

  data2(i: number, d2?: number) {
    return d2 === undefined
      ? Atomics.load(this, i * Timeline.COUNT + 4)
      : Atomics.store(this, i * Timeline.COUNT + 4, d2)
  }

  data3(i: number, d3?: number) {
    return d3 === undefined
      ? Atomics.load(this, i * Timeline.COUNT + 5)
      : Atomics.store(this, i * Timeline.COUNT + 5, d3)
  }
}
