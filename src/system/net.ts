// network the raw buffers over websockets

import { Animation } from 'src/buffer/animation'
import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Universal } from 'src/buffer/universal'
import { Value } from 'src/value/value'
import { System } from './system'

/*
# Net
 - [ ] only go online when needed
 - [ ] Host rooms, solicit as lobby
 - [ ] Join rooms from lobby/search
 - [ ] WSS is one stop shop for all network traffic
*/

// Network to the Bifrost post physics update
export class Net extends System {
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  size: Size
  animation: Animation
  universal: Universal
  remote: string
  rulerRealm: string

  ready = false

  connected = new Value(false)
  ws: WebSocket

  constructor() {
    super((1 / 15) * 1000)
    // send updates about as often as the physics updates
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
        break
      case this.remote:
        this.remote = e.data
        break
      case this.rulerRealm:
        this.rulerRealm = e.data
        this.connect()
        break
    }
  }

  connect() {
    this.ready = true
    this.ws = new WebSocket(`ws://${this.remote}/net/${this.rulerRealm}`)
    this.ws.binaryType = 'arraybuffer'
    this.ws.onopen = this.onopen.bind(this)
    this.ws.onerror = this.onerror.bind(this)
    this.ws.onmessage = this.onnet.bind(this)
    this.ws.onclose = this.onclose.bind(this)
  }

  onclose(e) {
    this.connected.set(false)
  }

  onerror(e) {
    console.log(e, e.message)
  }

  onnet(e) {
    console.log(e)
  }

  onopen() {
    this.connected.set(true)
  }

  tick() {
    // send accrued changes
  }
}

// Ask a MCP where the bifrost is
/* Concept
  Relay either full buffers or buffer maps to the Bifrost which echos it down based on room
*/

new Net()
