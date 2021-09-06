import { EMessage } from 'src/system/sys-enum'
import { Value } from 'src/value/value'
import { first, Realm, realms } from './realm'

export enum EMultiplayer {
  REALM_UPDATE = 0,
  ROOM_ID = 1,
}

class Multiplayer {
  host = new Value<boolean>()
  ws: WebSocket
  readyForMessage = true

  constructor() {
    this.host.on(() => {
      if (this.host.$ === undefined) return
      this.connect()
    })
    setInterval(this.tick.bind(this), 1000 / 15)
  }

  connect() {
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
      }/${window.location.pathname.slice(1)}/${window.location.hash.slice(1)}`
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

  onclose() {}

  onmessage(data: any) {
    // hello there
    const message = new Int32Array(data.data)

    // we're either doing a multipart or raedy for next message
    if (this.readyForMessage) {
      switch (message[0]) {
        case EMultiplayer.REALM_UPDATE:
          break
      }
    }
  }

  onerror() {}

  tick() {
    if (!this.host.$) return

    if (this.ws.readyState !== WebSocket.OPEN) return
    // send an update for each Land

    this.sendRealm(first.$)
    for (let realm of Object.values(realms)) {
      this.sendRealm(realm)
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
  }
}

export const multiplayer = new Multiplayer()

if (window.location.hash) {
  multiplayer.connect()
}
