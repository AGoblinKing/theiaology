import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Traits } from 'src/buffer/traits'
import { Universal } from 'src/buffer/universal'
import { ATOM_COUNT } from 'src/config'
import { Vector3 } from 'three'
import { System } from './system'

const $vec3 = new Vector3()

class Senses extends System {
  ready = false
  future: SpaceTime
  matter: Matter
  size: Size
  universal: Universal
  traits: Traits

  constructor() {
    super(200)
  }

  tick() {
    if (!this.ready) return

    for (let i = 0; i < ATOM_COUNT; i++) {
      // check to see if they're close enough to "hear"
      // close enough to "touch"
      // then go through hands to see if they're colliding
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
        this.init()
        break
    }
  }

  init() {
    this.ready = true
  }
}

new Senses()
