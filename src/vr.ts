import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js'
import { renderer, scene } from './render'
import { Value } from './store'
import { tick } from './time'
import { Handy } from './vendor/handy'

renderer.$.xr.enabled = true

export const button = VRButton.createButton(renderer.$)
document.body.appendChild(button)

export const onVRClick = new Value(false)
export const VRInit = new Value(false)

const modelFactory = new XRHandModelFactory()

button.addEventListener('click', () => {
  onVRClick.is(true)

  if (VRInit.$) return

  for (let i = 0; i < 2; i++) {
    const hand = renderer.$.xr.getHand(i)

    Handy.makeHandy(hand)

    scene.$.add(hand)
    const model = modelFactory.createHandModel(hand, 'boxes')
    hand.addEventListener('connected', (e) => {
      hand.userData.handedness = e.data.handedness
      hand.add(model)
    })
  }

  VRInit.is(true)
})

//  Now use Handy to “Handify” them:

tick.on(() => {
  Handy.update(undefined)
})
