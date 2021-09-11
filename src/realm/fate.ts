import { FATE_MAX } from 'src/config'
import { ESpell, ITimeline } from 'src/fate/enum_fate'

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
export class Fate extends Int32Array {
  static COUNT = 6
  static BLANK = [0, 0, 0, 0, 0, 0]
  available: number[]

  // expandable
  constructor(data = new Int32Array(Fate.COUNT * FATE_MAX)) {
    super(data)

    // reset available
    this.available = [...new Array(FATE_MAX)].map((_, i) => i)
    // never 0
    this.reserve()
  }

  copy(arr: ArrayBuffer) {
    this.freeAll()
    this.resetAvailable()

    const v = new DataView(arr)

    for (let i = 0; i < Math.min(arr.byteLength / 4, this.length); i++) {
      const ix = i * 4
      const val = v.getInt32(ix, true)

      if (i % Fate.COUNT === 0 && val !== 0) {
        this.available.splice(this.available.indexOf(i / Fate.COUNT), 1)
      }

      this[ix] = val
    }
  }
  // rip through array and create a tree
  toObject(): ITimeline {
    // cache markers by number

    const root = {
      flat: {},
      markers: {},
      $: [
        this.when(0),
        this.invoke(0),
        this.who(0),
        this.data0(0),
        this.data1(0),
        this.data2(0),
      ],
      _: {},
    }

    for (let i = 1; i < FATE_MAX; i++) {
      const com = this.invoke(i)

      // next, the others could be anywhere
      if (com === ESpell.NONE) continue

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
            _: {},
          }
      }

      switch (com) {
        case ESpell.TOME:
          root.markers[i] = this.text(i)

        // fall through
        default:
          if (!root.flat[i]) {
            root.flat[i] = {
              _: {},
            }
          }

          root.flat[i].$ = [
            this.when(i),
            com,
            who,
            this.data0(i),
            this.data1(i),
            this.data2(i),
          ]

          cursor._[i] = root.flat[i]
      }
    }

    return root
  }

  toJSON(): string {
    const { _, $ } = this.toObject()
    return JSON.stringify({ _, $ }, undefined, ' ')
  }

  // rip through and return a sorted array of the events
  toArray() {
    const res = [[]]
    // 1 is for control
    for (let i = 1; i < this.length; i++) {
      const w = this.invoke(i)

      // by using the buffer in order we can look to see if we can early exit
      if (w === ESpell.NONE) break

      res.push([
        this.when(i),
        w,
        this.who(i),
        this.data0(i),
        this.data1(i),
        this.data2(i),
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
    this.available = [...new Array(FATE_MAX - offset)].map((_, i) => i + offset)
  }

  // freeAll but do not mark them as available
  freeAll() {
    this.available = []

    for (let i = FATE_MAX - 1; i >= 0; i--) {
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
    this.set(Fate.BLANK, i * Fate.COUNT)
    this.available.unshift(i)
  }

  add(
    when: number,
    command: ESpell,
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
    const ix = i * Fate.COUNT

    this[ix] = when
    this[ix + 1] = command
    this[ix + 2] = who
    this[ix + 3] = d1
    this[ix + 4] = d2
    this[ix + 5] = d3

    return i
  }

  // defines are special, only strings available
  text(i: number, str?: string) {
    if (str === undefined) {
      return [this.data0(i), this.data1(i), this.data2(i)]
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
        this[i * Fate.COUNT + 3 + siy] = strView.getInt32(0, false)
      }
    }

    return str
  }

  // when
  when(i: number, when?: number) {
    return when === undefined
      ? this[i * Fate.COUNT]
      : (this[i * Fate.COUNT] = when)
  }

  // what event
  invoke(i: number, e?: ESpell) {
    return e === undefined
      ? this[i * Fate.COUNT + 1]
      : (this[i * Fate.COUNT + 1] = e)
  }

  // used for refering to something
  who(i: number, who?: number) {
    return who === undefined
      ? this[i * Fate.COUNT + 2]
      : (this[i * Fate.COUNT + 2] = who)
  }

  data0(i: number, d0?: number) {
    return d0 === undefined
      ? this[i * Fate.COUNT + 3]
      : (this[i * Fate.COUNT + 3] = d0)
  }

  data1(i: number, d1?: number) {
    return d1 === undefined
      ? this[i * Fate.COUNT + 4]
      : (this[i * Fate.COUNT + 4] = d1)
  }

  data2(i: number, d2?: number) {
    return d2 === undefined
      ? this[i * Fate.COUNT + 5]
      : (this[i * Fate.COUNT + 5] = d2)
  }
}
