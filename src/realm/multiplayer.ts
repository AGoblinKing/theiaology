import { Animation } from 'src/buffer/animation'
import { AtomicInt } from 'src/buffer/atomic'
import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Universal } from 'src/buffer/universal'
import { EMessage } from 'src/system/sys-enum'
import { EIdle } from 'src/timeline/def-timeline'
import { Value } from 'src/value/value'
import { first, Realm, realms } from './realm'

export enum EMultiplayer {
  REALM_UPDATE = 0,
  ROOM_ID = 1,
  E404 = 404,
}

class RealmUpdate {
  id: number
  animation: Animation
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  size: Size
  universal: Universal

  constructor(id) {
    this.id = id

    first.$.fate.on(() => {
      if (this.universal) this.render()
    })
  }
  clear() {
    this.animation = undefined
    this.past = undefined
    this.future = undefined
    this.matter = undefined
    this.size = undefined
    this.universal = undefined
  }

  onmessage(data: any) {
    switch (undefined) {
      case this.animation:
        this.animation = new Animation(data)
        break
      case this.past:
        this.past = new SpaceTime(data)
        break
      case this.future:
        this.future = new SpaceTime(data)
        break
      case this.matter:
        this.matter = new Matter(data)
        break
      case this.size:
        this.size = new Size(data)
        break
      case this.universal:
        this.universal = new Universal(data)
        this.render()
        return true
    }
  }

  copy(from: AtomicInt, to: AtomicInt) {
    for (let i = 0; i < from.length; i++) {
      to.store(i, from.load(i))
    }
  }

  render() {
    this.copy(this.future, first.$.future)
    this.copy(this.past, first.$.past)
    this.copy(this.matter, first.$.matter)
    this.copy(this.size, first.$.size)
    this.copy(this.universal, first.$.universal)
    this.copy(this.animation, first.$.animation)

    first.$.universal.idle(EIdle.None)
  }
}

class Multiplayer {
  host = new Value<boolean>()
  ws: WebSocket
  readyForMessage = true
  fresh = true
  realmUpdates: { [key: number]: RealmUpdate } = {}

  currentUpdate: RealmUpdate

  constructor() {
    this.host.on(() => {
      if (this.host.$ === undefined) return
      this.connect()
    })

    setInterval(this.tick.bind(this), 1000)

    window.addEventListener('hashchange', () => {
      this.connect()
    })
  }

  connect() {
    this.fresh = true
    if (this.ws) {
      this.ws.close()
    }

    if (!this.host.$) {
      console.log('joining')
      first.$.cardinal?.postMessage(EMessage.FREE_ALL)
    } else {
      console.log('hosting')
    }

    this.ws = new WebSocket(
      `ws://${window.location.hostname}:${window.location.port}/net/${
        this.host.$ ? 'host' : 'join'
      }/${window.location.pathname.slice(1)}?${window.location.hash.slice(1)}`
    )
    this.ws.binaryType = 'arraybuffer'
    this.ws.onopen = this.onopen.bind(this)
    this.ws.onerror = this.onerror.bind(this)
    this.ws.onmessage = this.onmessage.bind(this)
    this.ws.onclose = this.onclose.bind(this)
  }

  onopen() {
    console.log('opened')
  }

  onclose() {
    console.log('closed')
  }

  onmessage(data: any) {
    if (!this.currentUpdate) {
      // hello there
      const message = new Int32Array(data.data)

      // we're either doing a multipart or raedy for next message

      switch (message[0]) {
        case EMultiplayer.E404:
          console.log(404, "couldn't join no room")
          break
        case EMultiplayer.REALM_UPDATE:
          if (!this.realmUpdates[message[1]]) {
            this.realmUpdates[message[1]] = new RealmUpdate(message[1])
          }
          this.currentUpdate = this.realmUpdates[message[1]]
          this.currentUpdate.clear()
          break
      }
    } else {
      const satisfied = this.currentUpdate.onmessage(data.data)
      if (satisfied) {
        delete this.currentUpdate
      }
    }
  }

  onerror() {}

  tick() {
    if (!this.host.$) return

    if (this.ws.readyState !== WebSocket.OPEN) return
    // send an update for each Land

    if (this.fresh) {
      // this.fresh = false
      this.sendRealm(first.$)
      for (let realm of Object.values(realms)) {
        this.sendRealm(realm)
      }
    }
  }

  sendRealm(realm: Realm) {
    // build buffer of changes to send
    this.ws.send(new Int32Array([EMultiplayer.REALM_UPDATE, realm.id]))
    this.ws.send(realm.animation)
    this.ws.send(realm.past)
    this.ws.send(realm.future)
    this.ws.send(realm.matter)
    this.ws.send(realm.size)

    this.ws.send(realm.universal.slice())
  }
}

export const multiplayer = new Multiplayer()

if (window.location.hash) {
  multiplayer.connect()
}
