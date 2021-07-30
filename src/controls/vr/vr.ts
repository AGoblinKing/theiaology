import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { audio } from '../../audio/audio'
import { renderer, scene } from '../../render'
import { HandRez } from '../../rez/hand'
import { doRez, Rez } from '../../rez/rez'
import { Value } from '../../store'
import { IJointGroup } from './interface'

renderer.$.xr.enabled = true

export const button = VRButton.createButton(renderer.$)
document.body.appendChild(button)

export const onVRClick = new Value(false)
export const VRInit = new Value(false)

export const hand_controllers = new Value<IJointGroup[]>([])

button.addEventListener('click', () => {
  onVRClick.is(true)

  if (VRInit.$) return

  for (let i = 0; i < 2; i++) {
    const hand = renderer.$.xr.getHand(i) as any

    if (!hand) continue

    scene.$.add(hand)

    hand.addEventListener('connected', (e) => {
      hand.handedness = e.data.handedness
    })

    hand_controllers.$.push(hand)

    hand_controllers.poke()
  }

  audio.play()

  VRInit.is(true)
})

doRez.on(() => {
  for (let i = 0; i < hand_controllers.$.length; i++) {
    const count = Object.keys(hand_controllers.$[i].joints).length
    if (count === 0) continue

    // also triggers joint_update for each joint
    Rez(HandRez, count, hand_controllers.$[i])
  }
})
