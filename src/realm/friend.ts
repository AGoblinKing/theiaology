import { Value } from 'src/value'

const realm = `${window.location.pathname.slice(
  1
)}-${window.location.search.slice(1)}`

const url = `https://theiaology.com/multi/realm/${realm}`

const grab = (url: string, body?: any) =>
  fetch(url, {
    method: 'POST',
    body,
    mode: 'no-cors',
  }).then((res) => {
    console.log(res)
    if (!res.ok) return Promise.reject(res)
    return res.text()
  })

export class Friend {
  pc: RTCPeerConnection
  connected = new Value(false)

  constructor(offer?: RTCSessionDescriptionInit) {
    this.Setup()
    if (offer) this.AcceptOffer(offer)
  }

  AcceptOffer(description: RTCSessionDescriptionInit) {
    this.pc.setRemoteDescription(description)

    this.pc.createAnswer().then((a) => {
      this.pc.setLocalDescription(a)

      return a
    })
  }

  Setup() {
    if (this.pc) {
      this.pc.close()
    }

    this.pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    })

    this.pc.addEventListener('connectionstatechange', (e) => {
      console.log(e)
    })
  }

  OnOpen(e: Event) {
    this.connected.set(true)
    console.log('yo were open')
  }

  OnMessage(e: Event) {}

  async CreateOffer() {
    this.pc
      .createOffer()
      .then((d) => {
        this.pc.setLocalDescription(d)

        return d
      })
      .catch((err) => {
        this.connected.set(false)
        console.error(err)
      })
  }
}

export async function Join() {
  const offer = await grab(`${url}/join`)

  // @ts-ignore
  const friend = new Friend(JSON.parse(offer))

  return friend
}

export async function Host(count = 10) {
  const friends = []
  for (let i = 0; i < count; i++) {
    friends.push(new Friend())
  }

  const offers = await Promise.all(friends.map((f) => f.CreateOffer()))

  // host might throw if can't

  return fetch(`${url}/host`, {
    method: 'POST',
    body: offers.join('\n'),
    mode: 'no-cors',
  }).then(function (response) {
    if (!response.ok) {
      throw Error(response.statusText)
    }
    return response.text()
  })
}

export const connected = new Value(false)
