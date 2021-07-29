import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { audio } from './audio'
import { renderer, scene } from './render'
import { doRez, Rez } from './rez'
import { HandRez } from './rez/hand'
import { Value } from './store'

renderer.$.xr.enabled = true

export const button = VRButton.createButton(renderer.$)
document.body.appendChild(button)

export const onVRClick = new Value(false)
export const VRInit = new Value(false)

export const hands = new Value<any[]>([])

button.addEventListener('click', () => {
  onVRClick.is(true)

  if (VRInit.$) return

  for (let i = 0; i < 2; i++) {
    const hand = renderer.$.xr.getHand(i) as any

    if (!hand) continue

    scene.$.add(hand)

    hand.addEventListener('connected', (e) => {
      hand.userData.handedness = e.data.handedness
    })

    hands.$.push(hand)

    hands.poke()
  }

  audio.play()

  VRInit.is(true)
})

doRez.on(() => {
  for (let i = 0; i < hands.$.length; i++) {
    const count = Object.keys(hands.$[i].joints).length
    if (count === 0) continue

    Rez(HandRez, count, hands.$[i])
  }
})
