import { Animation } from 'src/buffer/animation'
import { Cage } from 'src/buffer/cage'
import { Fate } from 'src/buffer/fate'
import { Impact } from 'src/buffer/impact'
import { Matter } from 'src/buffer/matter'
import { Phys } from 'src/buffer/phys'
import { ESenses, Sensed } from 'src/buffer/sensed'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Thrust } from 'src/buffer/thrust'
import { EStatus, Traits } from 'src/buffer/traits'
import { ERealmState, Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ATOM_COUNT, NORMALIZER } from 'src/config'
import { ShapeMap } from 'src/fate/shape'
import { EIdle, ESpell } from 'src/fate/weave'
import { Spell } from 'src/grimoire/spell'
import spells from 'src/grimoire/spells'
import { MagickaVoxel } from 'src/magica'
import { Value } from 'src/value'
import { EMessage, ENotifyPosition, FRez, ICardinal } from './enum'
import { System } from './system'

// Deal out entity IDs, execute timeline events
class Cardinal extends System implements ICardinal {
  _available: number[] = [...new Array(ATOM_COUNT)].map((_, i) => i)
  // entity components
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  thrust: Thrust
  size: Size
  impact: Impact
  animation: Animation
  traits: Traits
  velocity: Velocity
  phys: Phys
  sensed: Sensed

  fate: Fate
  universal: Universal
  cage: Cage

  spells: { [def: number]: Spell } = {}

  // do a command at timing
  timing: { [time: number]: number[] } = {}
  ready = false

  lastTime = 0
  clutchFate = false
  voxes = new Value<{ [name: string]: MagickaVoxel }>({})

  constructor() {
    // Music Timing works off seconds
    super(200)
  }

  // receives buffers then IDs to free
  onmessage(e: MessageEvent) {
    switch (undefined) {
      case this.past:
        this.past = new SpaceTime(e.data)
        break
      case this.future:
        this.future = new SpaceTime(e.data)
        break
      case this.matter:
        this.matter = new Matter(e.data)
        break
      case this.thrust:
        this.thrust = new Thrust(e.data)
        break
      case this.size:
        this.size = new Size(e.data)
        break
      case this.animation:
        this.animation = new Animation(e.data)
        break
      case this.impact:
        this.impact = new Impact(e.data)
        break

      case this.traits:
        this.traits = new Traits(e.data)
        break

      case this.fate:
        this.fate = new Fate(e.data)
        break

      case this.universal:
        this.universal = new Universal(e.data)
        break

      case this.cage:
        this.cage = new Cage(e.data)
        break

      case this.velocity:
        this.velocity = new Velocity(e.data)
        break

      case this.phys:
        this.phys = new Phys(e.data)
        break

      case this.sensed:
        this.sensed = new Sensed(e.data)
        break

      // expecting IMessage but no atomics
      default:
        switch (typeof e.data) {
          case 'object':
            if (typeof e.data.message === 'number') {
              switch (e.data.message) {
                case EMessage.FAE_NOTIFY:
                  this.onFaeNotify(e.data)
                  break
              }
              return
            }
            // this is voxes data
            this.voxes.set(e.data)

            // update the timeline
            this.ready = true
            this.fateUpdated()
            return

          case 'number':
            if (e.data > 0) {
              this.free(e.data)
              break
            }
            switch (e.data) {
              case EMessage.SENSE_TICK:
                this.Senses()
                break
              case EMessage.PHYS_TICK:
                this.Collisions()
                break
              case EMessage.CARD_SEEKED:
                this.clutchFate = false
                break
              case EMessage.REZ:
                this.post(this.reserve())
                break

              case EMessage.FREE_ALL:
                this.freeAll()
                break

              case EMessage.FATE_UPDATE:
                this.fateUpdated()

                break
            }
            return
        }
    }
  }

  onFaeNotify(msg: { loc: ENotifyPosition; data: string }) {
    // create a spell for this message and execute it
  }

  doTurn(sec?: number) {
    if (sec === undefined) sec = this.universal.musicTime()
    if (!this.timing[sec]) return

    const toRez = []

    for (let i of this.timing[sec]) {
      const def = this.fate.who(i)
      const $spell = this.spells[def]

      if (!$spell) continue

      // Check the timing to only apply the right stuff
      if (this.fate.when(i) > sec) continue

      const s = this.fate.spell(i)

      if (spells[s]) {
        const r = spells[s](i, this, $spell, sec)
        if (typeof r === 'number') {
          toRez.push(r)
        }
      }
    }

    for (let rez of toRez) {
      for (let c = 0; c < this.fate.data0(rez); c++) {
        this.entity(this.fate.who(rez))
      }
    }

    // clean up from turn
    for (let def of Object.values(this.spells)) {
      def.dirty.clear()
    }
  }

  // Entity ID number to init
  entity(def: number) {
    // navigate up the tree to root
    // build for loops to apply

    const t = this.universal.time()
    const $spell = this.spells[def]

    // now we rez
    // determine voxel count, for loop over them
    const shape =
      ShapeMap[$spell.flock.shape === undefined ? 0 : $spell.flock.shape]
    if (!shape) {
      throw new Error("couldn't find shape on shapemap" + $spell.flock.shape)
    }

    const atoms = shape.AtomCount(
      $spell.flock.size,
      $spell.flock.step,
      $spell.flock.size2
    )
    for (let i = 0; i < atoms; i++) {
      const $shape = shape(
        i,
        $spell.flock.size,
        $spell.flock.step,
        $spell.flock.size2
      )

      // apply $rez data

      const x =
        $spell.pos.x +
        $shape.x +
        Math.round($spell.posvar.x * Math.random() * 2 - $spell.posvar.x)
      const y =
        $spell.pos.y +
        $shape.y +
        Math.round($spell.posvar.y * Math.random() * 2 - $spell.posvar.y)

      const z =
        $spell.pos.z +
        $shape.z +
        Math.round($spell.posvar.z * Math.random() * 2 - $spell.posvar.z)

      const sx = $spell.size.x + Math.round(Math.random() * $spell.sizevar.x)
      const sy = $spell.size.y + Math.round(Math.random() * $spell.sizevar.y)
      const sz = $spell.size.z + Math.round(Math.random() * $spell.sizevar.z)

      switch (true) {
        // land
        case $spell.land !== undefined:
          this.post({
            message: EMessage.LAND_ADD,
            x,
            y,
            z,
            id: $spell.id,
            ruler: $spell.ruler,
            land: $spell.land,
            cage: $spell.cage,
            shape: $spell.size,
          })

          $spell.lands++
          continue
        // is voxel rez
        case $spell.vox !== '' && this.voxes.$[$spell.vox] !== undefined:
          // Need to clean this part up
          $spell.Vox(x, y, z, sx, sy, sz, t)
          continue
        // is text rez
        case $spell.text !== undefined:
          $spell.Text(x, y, z, sx, sy, sz, t)
          continue
        default:
          $spell.Basic(x, y, z, sx, sy, sz, t)
      }
    }
  }

  process() {
    const timing = this.universal.musicTime()
    this.lastTime = timing
    // run through timeline and execute rezes
    for (let i = 0; i < this.fate.length / Fate.COUNT; i++) {
      const t = this.fate.when(i)
      const s = this.fate.spell(i)
      if (s === ESpell.NONE) continue

      this.timing[t] = this.timing[t] || []
      this.timing[t].push(i)

      const def = this.fate.who(i)

      if (!this.spells[def]) {
        this.spells[def] = new Spell(def, this)
      }
      const parent = this.fate.who(def)

      // avoid loop 0 => 0
      if (parent !== def) {
        const p = (this.spells[parent] =
          this.spells[parent] || new Spell(parent, this))
        p._.push(this.spells[def])
      }
    }

    let t = 0
    while (t <= timing) {
      this.doTurn(t++)
    }
  }

  fateUpdated() {
    if (!this.ready) {
      return
    }
    this.freeAll()
    // clear it
    this.timing = {}
    // clean up from turn
    for (let def of Object.values(this.spells)) {
      def.Reset()
    }

    this.universal.score(0)
    this.universal.gravityX(0)
    this.universal.gravityY(0)
    this.universal.gravityZ(0)
    this.universal.avatar(0)

    this.post(EMessage.CLEAR_COLOR_UPDATE)

    this.process()

    this.post(EMessage.FATE_UPDATE)
  }

  freeAll() {
    for (let i = 0; i < ATOM_COUNT; i++) {
      this.free(i)
    }
    this._available = [...new Array(ATOM_COUNT)].map((_, i) => i)
  }

  free(i: number) {
    this.animation.free(i, Animation.COUNT)
    this.future.free(i, SpaceTime.COUNT)
    this.past.free(i, SpaceTime.COUNT)
    this.thrust.free(i, Thrust.COUNT)
    this.matter.free(i, Matter.COUNT)
    this.impact.free(i, Impact.COUNT)
    this.size.free(i, Size.COUNT)
    this.cage.free(i, Cage.COUNT)
    this.velocity.free(i, Velocity.COUNT)
    this.traits.free(i, Traits.COUNT)
    this.phys.free(i, Phys.COUNT)
  }

  available(i: number) {
    this.free(i)
    this._available.push(i)
  }

  reserve: FRez = () => {
    const i = this._available.pop()
    this.free(i)

    this.traits.status(i, EStatus.Assigned)
    return i
  }

  tick() {
    if (!this.ready || this.universal.state() !== ERealmState.RUNNING) return

    const t = this.universal.musicTime()
    if (t > this.lastTime || this.clutchFate) {
      let lt = this.lastTime
      while (lt < t) {
        lt++
        this.doTurn(lt)
      }

      this.lastTime = t

      // back in time
    } else if (t < this.lastTime) {
      this.fateUpdated()
    }

    switch (this.universal.idle()) {
      case EIdle.RANDOMIZE:
        this.randomize()
        break
    }

    this.post(EMessage.CARD_TICK)
  }

  randomize() {
    // TODO: Use cage bounds
    const scale = 100000
    const t = this.universal.time()

    const chunk = 1000
    // lets prove out thhese even render
    for (let ix = last; ix < last + chunk; ix++) {
      // only use left overs
      const i = this._available[ix % this._available.length]
      this.past.x(i, this.future.x(i))
      this.past.y(i, this.future.y(i))
      this.past.z(i, this.future.z(i))
      this.past.time(i, t)

      this.future.x(i, Math.floor(Math.random() * scale - scale / 2))
      this.future.y(i, Math.floor(Math.random() * scale - scale / 2))
      this.future.z(i, Math.floor(Math.random() * scale - scale / 2))
      this.future.time(i, t + 30000 + 100)

      const s = 20 + Math.floor(Math.random() * 5)

      this.size.x(i, s)
      this.size.y(i, s)
      this.size.z(i, s)

      this.matter.blue(i, NORMALIZER)
      this.matter.red(i, Math.floor(Math.random() * NORMALIZER))
      this.matter.green(i, Math.floor(Math.random() * NORMALIZER))
    }

    last += chunk
  }

  // Collisions are for any physical bodies
  Collisions() {}

  // Senses don't require avatar, better for GATE and other things
  Senses() {
    let i = 0
    let id = 0

    while ((id = this.sensed.id(i)) !== 0) {
      let sense = this.sensed.sense(i)
      let spell = this.spells[this.phys.spell(id)]

      i++

      if (!spell) continue
      if ((sense & ESenses.FELT) === ESenses.FELT) {
        spell.gate &&
          this.post({
            message: EMessage.CARD_GATE,
            ruler: spell.ruler,
            realm: spell.gate,
          })
      }
    }
  }
}

let last = 0

new Cardinal()
