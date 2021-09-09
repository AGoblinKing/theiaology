import { YGGDRASIL } from 'src/config'
import { multi } from 'src/input/browser'
import { renderer } from 'src/render/render'
import { Value } from 'src/value'
import { FloatType, NearestFilter, RGBAFormat, WebGLRenderTarget } from 'three'

class Yggdrasil {
  remote: RTCPeerConnection
  data: RTCDataChannel
  realm = multi.$

  connected = new Value(false)
  attempting = new Value(false)

  last_message = Date.now()
  beater: any

  renderTarget = new WebGLRenderTarget(256, 256, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    type: FloatType,
    stencilBuffer: false,
  })

  // The rainbow bridge
  bifrost = document.createElement('canvas')
  ctx = this.bifrost.getContext('2d')

  // @ts-ignore
  source = this.bifrost.captureStream(15)
  buffer = new ImageData(256, 256)

  constructor() {
    if (this.realm === '') return

    this.bifrost.height = this.bifrost.width = 512

    this.forgeConnection()

    this.debug()
  }

  debug() {
    document.body.appendChild(this.bifrost)
    Object.assign(this.bifrost.style, {
      position: 'absolute',
      top: '0',
      right: '0',
      zIndex: '19999',
    })
  }

  forgeConnection() {
    this.connected.set(false)
    this.attempting.set(true)

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

    for (let track of this.source.getTracks()) {
      this.remote.addTrack(track, this.source)
    }

    this.remote.ontrack = this.OnTrack.bind(this)
  }

  OnTrack(e: RTCTrackEvent) {
    console.log(e)
  }

  OnOpen(e) {
    this.connected.set(true)
    this.attempting.set(false)

    this.data.send(this.realm)
  }

  OnMessage(e) {}

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
        this.connected.set(false)
        console.error(err)
      })
  }

  render() {
    if (!this.connected.$) return

    renderer.readRenderTargetPixels(
      this.renderTarget,
      0,
      0,
      256,
      256,
      this.buffer
    )

    this.ctx.putImageData(this.buffer, 0, 0)
  }
}

export const yggdrasil = new Yggdrasil()
