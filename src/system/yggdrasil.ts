import { Input } from 'src/buffer/input'
import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { YGGDRASIL } from 'src/config'
import { EMessage } from './enum'
import { LocalSystem } from './system'

export class Yggdrasil extends LocalSystem {
  remote: RTCPeerConnection
  data: RTCDataChannel

  future: SpaceTime
  matter: Matter
  size: Size
  input: Input
  realm: string

  host = false

  constructor() {
    super(200)
  }

  onmessage(e: { data: any }) {
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

      case this.realm:
        this.realm = e.data

        break
      case this.input:
        this.input = new Input(e.data)
        this.init()
        break
    }
  }

  connect() {
    if (this.remote) {
      this.remote.close()
    }

    this.remote = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun3.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ],
        },
      ],
    })

    this.remote.onnegotiationneeded = this.OnNegotiate.bind(this)

    this.data = this.remote.createDataChannel(this.realm)
    this.data.onmessage = this.dataMessage.bind(this)
  }

  dataMessage(e: { data: any }) {
    const command = parseInt(e.data, 10)
    if (isNaN(command)) return

    switch (command) {
      case EMessage.YGG_HOST:
        this.host = true
        break
      case EMessage.YGG_JOIN:
        // we joined the realm
        break
    }
  }

  OnNegotiate(e) {
    this.remote
      .createOffer()
      .then((d) => {
        this.remote.setLocalDescription(d)

        fetch(YGGDRASIL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Channel: this.realm,
          },
          body: JSON.stringify(d),
          mode: 'cors',
        })
          .then((r) => r.json())
          .then((answer) => {
            const description = new RTCSessionDescription(answer)
            this.remote.setRemoteDescription(description)
          })
          .catch(() => {
            setTimeout(() => {
              this.OnNegotiate(e)
            }, 10000)
          })
      })
      .catch((err) => {
        console.error(err)
      })
  }

  tick() {
    // send the buffers off
  }

  init() {
    if (this.realm === '' || this.realm === undefined) return

    this.connect()
  }
}
