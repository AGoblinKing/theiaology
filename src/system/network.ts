// network the raw buffers over websockets

import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Universal } from 'src/buffer/universal'
import { System } from './system'

// Network to the Bifrost post physics update
class Network extends System {
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  size: Size
  animation: Animation
  universal: Universal

  ready = false
  connected = false

  constructor() {
    super((1 / 5) * 1000)
    // send
  }

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
      case this.size:
        this.size = new Size(e.data)
        break
      case this.animation:
        this.animation = new Animation(e.data)
        break
      case this.universal:
        this.universal = new Universal(e.data)
        this.ready = true
        break
    }
  }

  tick() {
    // send accrued changes
  }
}

// Ask a MCP where the bifrost is
/* Concept
  Relay either full buffers or buffer maps to the Bifrost which echos it down based on room
*/

new Network()
