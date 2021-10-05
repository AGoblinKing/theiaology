import { Matter } from 'src/buffer/matter'
import { Phys } from 'src/buffer/phys'
import { Sensed } from 'src/buffer/sensed'
import { BBox, Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Traits } from 'src/buffer/traits'
import { Universal } from 'src/buffer/universal'
import { ATOM_COUNT, SENSE_DISTANCE } from 'src/config'
import { Vector3 } from 'three'
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

  constructor() {
    super(200)
  }

  tick() {
    if (!this.ready) return

    const pos = $vec3.set(
      this.universal.faeX(),
      this.universal.faeY(),
      this.universal.faeZ()
    )

    let si = 0
    const { felt, hear } = SENSE_DISTANCE
    myBox.min.set(pos.x - felt, pos.y - felt * 5, pos.z - felt)
    myBox.max.set(pos.x + felt, pos.y + felt * 5, pos.z + felt)

    for (let i = 0; i < ATOM_COUNT; i++) {
      // check to see if they're close enough to "hear"
      const dist = pos.distanceTo(this.future.vec3(i))
      this.phys.distanceToFae(i, dist)

      if (dist > hear) {
        continue
      }
      // hear and see
      let sensed = 0xff

      //  close enough to "touch"
      const them = this.size.box(i, this.future)
      if (myBox.intersectsBox(them)) {
        // we intersected them!
        sensed += 0xf000
        // are any of our hands touching them
      }
      // are touching our body
      // are touching our hands
      let entry = si++
      this.sensed.id(entry, i)
      this.sensed.sense(entry, sensed)
    }

    // clear out old ones
    while (this.sensed.id(si++) !== 0) {
      this.sensed.sense(si, 0)
      this.sensed.id(si, 0)
    }
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
        this.init()
        break
    }
  }

  init() {
    this.ready = true
  }
}

new Senses()
