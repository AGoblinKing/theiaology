import 'src/file/file'
// @ts-ignore - tots is a module
import Theiaology from 'src/timeline/Theiaology.svelte'
import {
  animation,
  cage,
  future,
  impact,
  matter,
  past,
  size,
  status,
  timeline,
  universal,
  velocity,
} from './buffer'
import { voxes } from './buffer/vox'
import { NORMALIZER } from './config'
import './controller/player'
import { body, renderer } from './render/render'
import { RezHands } from './rez/hand-joints'
import './shader/atoms'
import './sound/audio'
import { sys } from './system/sys'
import { EMessage } from './system/sys-enum'

// setup systems
const cardinal = sys
  .start('cardinal')
  .send(
    past,
    future,
    matter,
    velocity,
    size,
    animation,
    impact,
    status,
    timeline.$,
    universal,
    cage
  )
  .on((e) => {
    switch (e) {
      case EMessage.USER_ROT_UPDATE:
        body.$.rotation.set(
          (universal.userRX() / NORMALIZER) * Math.PI * 2,
          (universal.userRY() / NORMALIZER) * Math.PI * 2,
          (universal.userRZ() / NORMALIZER) * Math.PI * 2
        )

        break
      case EMessage.USER_POS_UPDATE:
        body.$.position.set(
          universal.userX(),
          universal.userY(),
          universal.userZ()
        )
        break
      case EMessage.CLEAR_COLOR_UPDATE:
        renderer.setClearColor(universal.clearColor())
        break
    }
  })

const physics = sys
  .start('physics')
  .send(past, future, matter, velocity, size, impact, universal, cage)
  .bind(cardinal)

timeline.on(($t) => {
  if ($t === undefined) return

  cardinal.send(EMessage.TIMELINE_UPDATE)
  cardinal._queue = []

  // Rez the player hands
  RezHands(cardinal)
})

voxes.on(($voxes) => {
  cardinal.send($voxes)
})

// @ts-ignore
window.theia = {
  past,
  future,
  matter,
  velocity,
  size,
  animation,
  impact,
  status,
  timeline,
  universal,
  voxes,
  cardinal,
  physics,
}

// startup editor
const theiaology = new Theiaology({
  target: document.getElementById('theiaology'),
  props: {},
})

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service.js', { scope: '/' })
}
