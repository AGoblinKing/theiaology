import { AtomicInt } from 'src/atomic'
import { TIMELINE_START_SIZE } from 'src/config'

// easier for humans to read
export interface ITimeline {
  [key: string]: number[] | ITimeline
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
}

// ETimeline events are reversable transactions that allow for time travel
// WARNING: Safe to add new events to end but not remove/reorder existing ones
export enum ETimeline {
  None = 0,
  Marker,
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
  Copy,
}

export const Commands: { [key: number]: [who: ETimeline, params: any] } = {
  [ETimeline.Marker]: [ETimeline.Marker, { text: EVar.String }],
  [ETimeline.Flock]: [
    ETimeline.Marker,
    { shape: EVar.Shape, count: EVar.Positive },
  ],
  [ETimeline.Color]: [
    ETimeline.Flock,
    {
      rgb: EVar.Color,
      tilt: EVar.Number,
      variance: EVar.Normal,
    },
  ],
  [ETimeline.Shape]: [ETimeline.Flock, { shape: EVar.Shape }],
  [ETimeline.Scale]: [
    ETimeline.Flock,
    { x: EVar.Positive, y: EVar.Positive, z: EVar.Positive },
  ],
  [ETimeline.ScaleVariance]: [
    ETimeline.Flock,
    {
      x: EVar.Positive,
      y: EVar.Positive,
      z: EVar.Positive,
    },
  ],
  [ETimeline.Rotation]: [
    ETimeline.Flock,
    { x: EVar.Number, y: EVar.Number, z: EVar.Number },
  ],
  [ETimeline.Rez]: [ETimeline.Flock, { xyz: EVar.Position }],
  [ETimeline.DeRez]: [ETimeline.Flock, {}],
  [ETimeline.Copy]: [ETimeline.Flock, { text: EVar.String }],
  [ETimeline.Interval]: [
    ETimeline.Marker,
    {
      seconds: EVar.Positive,
      start: EVar.TimelineID,
      end: EVar.Positive,
    },
  ],
  [ETimeline.StopInterval]: [ETimeline.Interval, {}],
  [ETimeline.MoveToPosition]: [ETimeline.Flock, { xyz: EVar.Position }],
  [ETimeline.MoveToFlock]: [ETimeline.Flock, { flock: EVar.FlockID }],
  [ETimeline.ApplyVelocity]: [
    ETimeline.Flock,
    { x: EVar.Number, y: EVar.Number, z: EVar.Number },
  ],
  [ETimeline.ApplyRandomVelocity]: [
    ETimeline.Flock,
    { thrust: EVar.Positive, axis: EVar.Axis },
  ],
  [ETimeline.LookAtPosition]: [ETimeline.Flock, { xyz: EVar.Position }],
  [ETimeline.LookAtFlock]: [ETimeline.Flock, { flock: EVar.FlockID }],
}

function BuildObject(
  markers: { [key: number]: string },
  data: { [key: number]: number[] },
  parentage: { [key: number]: number[] },
  cursor = 0
) {
  const obj = {}
  for (let child of parentage[cursor]) {
    obj[markers[child] || child] = {
      children: BuildObject(markers, data, parentage, child),
      data: data[child],
    }
  }
  return obj
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
  constructor(
    sab = new SharedArrayBuffer(Timeline.COUNT * 4 * TIMELINE_START_SIZE)
  ) {
    super(sab)
    this.available = [...new Array(Timeline.COUNT)].map((_, i) => i)
  }

  // rip through array and create a tree
  toObject(): ITimeline {
    // cache markers by number
    const markers: { [markerID: number]: string } = {}
    const data: { [id: number]: number[] } = {}
    const parentage: { [parentID: number]: number[] } = {}

    for (let i = 0; i < this.length; i++) {
      const w = this.command(i)

      // Early exit
      if (w === ETimeline.None) break
      const who = this.who(i)

      switch (w) {
        case ETimeline.None:
          return BuildObject(markers, data, parentage)
        case ETimeline.Marker:
          markers[i] = this.marker(i)

          parentage[who] = parentage[who] || []
          parentage[who].push(i)

          break

        default:
          parentage[who] = parentage[who] || []
          parentage[who].push(i)

          data[i] = [
            this.command(i),
            this.who(i),
            this.data1(i),
            this.data2(i),
            this.data3(i),
          ]
      }
    }

    return BuildObject(markers, data, parentage)
  }

  fromObject(obj: ITimeline) {
    throw new Error('Not Implemented')
  }

  // rip through and return a sorted array of the events
  toArray() {
    const res = []
    for (let i = 0; i < this.length; i++) {
      const w = this.command(i)

      // by using the buffer in order we can look to see if we can early exit
      if (w === ETimeline.None) break

      res.push([w, this.who(i), this.data1(i), this.data2(i), this.data3(i)])
    }

    return res.sort((e1, e2) => {
      return e1.when - e2.when
    })
  }

  fromArray(arr: number[][]) {
    // reset existing
    this.freeAll()

    for (let i = 0; i < arr.length; i++) {
      this.add.apply(this, arr[i])
    }

    // reset available
    this.available = [...new Array(Timeline.COUNT - arr.length)].map(
      (_, i) => i + arr.length
    )
  }

  // freeAll but do not mark them as available
  freeAll() {
    for (let i = 0; i < this.length; i++) {
      for (let c = 0; c < Timeline.COUNT; c++) {
        super.free(i * Timeline.COUNT + c, Timeline.COUNT)
      }
    }
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
  marker(i: number, marker?: string) {
    if (marker === undefined) {
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
    marker = marker.slice(0, 12)

    for (let si = 0; si < 12; si++) {
      const six = si % 4
      const siy = Math.floor(si / 4)

      if (si < marker.length) {
        strView.setUint8(six, marker.charCodeAt(si))
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

    return marker
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
