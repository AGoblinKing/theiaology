import { Input } from 'src/buffer/input'
import { Matter } from 'src/buffer/matter'
import { Phys } from 'src/buffer/phys'
import { ESenses, Sensed } from 'src/buffer/sensed'
import { BBox, Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { EStatus, Traits } from 'src/buffer/traits'
import { Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ATOM_COUNT, SENSE_DISTANCE } from 'src/config'
import { Vector3 } from 'three'
import { EMessage } from './enum'
import { System } from './system'

const $vec3 = new Vector3()
const myBox = new BBox()

class Senses extends System {
  ready = false
  future: SpaceTime
  matter: Matter
  size: Size
  universal: Universal
  traits: Traits
  sensed: Sensed
  phys: Phys
  velocity: Velocity
  input: Input

  blinder: number

  constructor() {
    super(1000)
  }

  tick() {
    if (!this.ready) return

    const pos = $vec3.set(
      this.universal.faeX(),
      this.universal.faeY(),
      this.universal.faeZ()
    )

    let si = 0
    const { felt, hear, see } = SENSE_DISTANCE

    for (let i = 0; i < ATOM_COUNT; i++) {
      // if unassigned or inserted outside of cardinal do not sense
      if (
        this.traits.status(i) === EStatus.Unassigned ||
        this.phys.spell(i) === 0
      )
        continue

      //  close enough to "touch"
      const them = this.size.box(i, this.future)

      const dist = them.distanceToPoint(pos)

      // TODO: is this used? this.phys.distance(i, dist)
      if (dist > see) continue
      let sensed = ESenses.SIGHT

      if (dist < hear) {
        // hear
        sensed += ESenses.HEAR

        if (dist < felt) {
          // we intersected them!
          sensed += ESenses.FELT
        }
      }

      let entry = si++
      this.sensed.id(entry, i)
      this.sensed.sense(entry, sensed)
    }

    // clear out old ones
    let id = 0
    while ((id = this.sensed.id(si++)) !== 0 && si < ATOM_COUNT) {
      this.sensed.sense(si, 0)
      this.sensed.id(si, 0)
    }

    this.post(EMessage.SENSE_TICK)
  }

  onmessage(e: MessageEvent) {
    switch (undefined) {
      case this.future:
        this.future = new SpaceTime(e.data)
        break
      case this.matter:
        this.matter = new Matter(e.data)
        break

      case this.size:
        this.size = new Size(e.data)
        break

      case this.universal:
        this.universal = new Universal(e.data)
        break

      case this.traits:
        this.traits = new Traits(e.data)
        break
      case this.sensed:
        this.sensed = new Sensed(e.data)
        break
      case this.phys:
        this.phys = new Phys(e.data)

        break

      case this.velocity:
        this.velocity = new Velocity(e.data)

        break
      case this.input:
        this.input = new Input(e.data)
        this.ready = true
        break
      default:
        switch (e.data) {
          case EMessage.FATE_UPDATE:
            break
        }
    }
  }
}

new Senses()
