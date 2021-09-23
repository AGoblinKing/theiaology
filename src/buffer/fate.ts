import { AtomicInt } from 'src/buffer/atomic'
import { NORMALIZER, TIMELINE_MAX } from 'src/config'
import { ESpell, EVar, IFate, INode, Invocations } from 'src/fate/weave'
import { Color } from 'three'

const strConvertBuffer = new ArrayBuffer(4) // an Int32 takes 4 bytes
const strView = new DataView(strConvertBuffer)

const $color = new Color()

function CharCode(code: number) {
  switch (code) {
    case 0:
      return ''
    default:
      return String.fromCharCode(code)
  }
}

// 60^n
const timeEscalation = [1, 60, 60 * 60]
function FromDateString(str: string) {
  return str
    .split(':')
    .reverse()
    .reduce((s, t, i) => {
      return s + parseInt(t, 10) * timeEscalation[i]
    }, 0)
}

function ToDateString(seconds: number) {
  const s = seconds % 60
  const h = Math.floor(seconds / (60 * 60))
  const m = Math.floor(seconds / 60) % 60
  return `${h > 0 ? `${h}:` : ``}${m > 0 ? `${m}:` : ``}${s}`
}
// Authoring Buffer - Generally shouldn't be updating the timeline unless during development
export class Fate extends AtomicInt {
  static COUNT = 6
  available: number[]

  // expandable
  constructor(sab = new SharedArrayBuffer(Fate.COUNT * 4 * TIMELINE_MAX)) {
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

      if (i % Fate.COUNT === 0 && val !== 0) {
        this.available.splice(this.available.indexOf(i / Fate.COUNT), 1)
      }
      this.store(i, val)
    }
  }
  // rip through array and create a tree
  toObject(): IFate {
    // cache markers by number

    const root = {
      flat: {},
      markers: {},
      $: [
        this.when(0),
        this.spell(0),
        this.who(0),
        this.data0(0),
        this.data1(0),
        this.data2(0),
      ],
      _: {},
    }

    for (let i = 1; i < TIMELINE_MAX; i++) {
      const com = this.spell(i)

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

  toScript(): string {
    const obj = this.toObject()

    let output =
      '# You have encountered Fate! \n# Load on https://theiaology.com\n\n'

    const addChild = (target: INode, t = 0) => {
      const addT = () => [...new Array(t)].map(() => '\t').join('')
      // render
      for (let child of Object.entries(target._)) {
        // get commmand
        const [k, v] = child
        const [when, comm, who] = v.$

        output += `\n${addT()}(`

        const invoke = Invocations[comm]

        if (invoke !== ESpell.TOME && when !== 0) {
          output += `${ToDateString(when)} `
        }

        output += `${ESpell[comm].toLowerCase()} `

        if (invoke) {
          // check for data
          const evarInfo = Object.values(invoke)
          for (let i = 0; i < evarInfo.length; i++) {
            const e = evarInfo[i]
            const d = v.$[3 + i]

            switch (e) {
              case EVar.BOOL:
                output += `${d ? 'true' : 'false'} `
                break
              case EVar.VOX:
              case EVar.STRING:
                output += `"${this.text(parseInt(k, 10))}" `
                break
              case EVar.COLOR:
                output += `0x${$color.set(d).getHexString()} `
                break
              case EVar.NORMAL:
                output += `${d / NORMALIZER} `
                break
              case EVar.USERNUMBER:
              case EVar.USERPOSITIVE:
                output += `${d * 0.01} `
                break
              case EVar.NEGATIVE:
              case EVar.POSITIVE:
              case EVar.NUMBER:
                output += `${d} `
                break

              default:
                // probably an enum
                output += `${e[d]} `
            }
          }
        }
        // children
        if (Object.keys(v._).length > 0) {
          addChild(v, t + 1)
          output += `\n${addT()}`
        }

        output += `)`
      }
    }

    addChild(obj)

    output += '\n'
    return output
  }

  fromScript(name: string, script: string) {
    this.freeAll()

    script = script.replace(/[\n\t]/g, '')

    const RBLOB = /\(.*\)/

    const commands = []
    const text = []

    let res = RBLOB.exec(script)
    if (res === null) return

    // just the commands now
    script = res[0]

    this.text(0, name)

    while ((res = /\(([A-Za-z0-9!.?$#\-+*/':"_ ]*)\)/g.exec(script))) {
      let txt
      let code = res[1]

      // pull out text blobs
      while ((txt = /['"]([A-Za-z0-9 .+\\:\-!?]*)['"]/g.exec(code))) {
        code = splice(code, txt.index, txt[0].length, `$${text.length}`)
        text.push(txt[1])
      }

      commands.push(code)
      script = splice(script, res.index, res[0].length, `#${commands.length} `)
    }

    for (let command of commands) {
      try {
        const i = this.reserve()

        let spell: ESpell
        let d = 0

        let evoke
        let ks
        for (let item of command.split(' ')) {
          if (item.length === 0) continue
          if (spell === undefined) {
            // parse to see if this is a time
            const t = FromDateString(item)
            if (isNaN(t)) {
              // @ts-ignore
              spell = ESpell[item.toUpperCase()]

              this.spell(i, spell)
              evoke = Invocations[spell]
              ks = Object.values(evoke || {})
            } else {
              this.when(i, t)
            }

            continue
          }

          if (item[0] === '#') {
            this.who(parseInt(item.slice(1), 10), i)
            continue
          }

          // this is a data item
          if (!evoke || ks[d] === undefined) continue

          const dat = `data${d}`
          switch (ks[d]) {
            case EVar.COLOR:
              this[dat](i, parseInt(item, 16))
              break
            case EVar.USERNUMBER:
            case EVar.USERPOSITIVE:
              this[dat](i, Math.round(parseFloat(item) * 100))
              break
            case EVar.NORMAL:
              this[dat](i, parseFloat(item) * NORMALIZER)
              break
            case EVar.POSITIVE:
            case EVar.NEGATIVE:
            case EVar.NUMBER:
              this[dat](i, parseInt(item, 10))
              break
            case EVar.STRING:
            case EVar.VOX:
              this.text(i, text[item.slice(1)])
              break

            case EVar.BOOL:
              this[dat](i, item === 'true')
              break
            default:
              // probably an enum
              this[dat](i, ks[d][item])
          }
          d++
        }
      } catch (e) {
        console.error('LISP', command, e)
      }
    }
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
      const w = this.spell(i)

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
    this.reserve()
  }

  reserve() {
    return this.available.shift()
  }

  free(i: number) {
    super.free(i, Fate.COUNT)
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

    Atomics.store(this, i * Fate.COUNT, when)
    Atomics.store(this, i * Fate.COUNT + 1, command)
    Atomics.store(this, i * Fate.COUNT + 2, who)
    Atomics.store(this, i * Fate.COUNT + 3, d1)
    Atomics.store(this, i * Fate.COUNT + 4, d2)
    Atomics.store(this, i * Fate.COUNT + 5, d3)

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
        Atomics.store(
          this,
          i * Fate.COUNT + 3 + siy,
          strView.getInt32(0, false)
        )
      }
    }

    return str
  }

  // when
  when(i: number, when?: number) {
    return when === undefined
      ? Atomics.load(this, i * Fate.COUNT)
      : Atomics.store(this, i * Fate.COUNT, when)
  }

  // what event
  spell(i: number, e?: ESpell) {
    return e === undefined
      ? Atomics.load(this, i * Fate.COUNT + 1)
      : Atomics.store(this, i * Fate.COUNT + 1, e)
  }

  // used for refering to something
  who(i: number, who?: number) {
    return who === undefined
      ? Atomics.load(this, i * Fate.COUNT + 2)
      : Atomics.store(this, i * Fate.COUNT + 2, who)
  }

  data0(i: number, d1?: number) {
    return d1 === undefined
      ? Atomics.load(this, i * Fate.COUNT + 3)
      : Atomics.store(this, i * Fate.COUNT + 3, d1)
  }

  data1(i: number, d2?: number) {
    return d2 === undefined
      ? Atomics.load(this, i * Fate.COUNT + 4)
      : Atomics.store(this, i * Fate.COUNT + 4, d2)
  }

  data2(i: number, d3?: number) {
    return d3 === undefined
      ? Atomics.load(this, i * Fate.COUNT + 5)
      : Atomics.store(this, i * Fate.COUNT + 5, d3)
  }
}

function splice(str, index, count, add = '') {
  return `${str.slice(0, index)}${add}${str.slice(index + count)}`
}
