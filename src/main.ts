import 'src/file/file'
import Theiaology from 'src/timeline/Theiaology.svelte'
import {
  animation,
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
import './controller/player'
import { RezHands } from './rez/hand-joints'
import './shader/atoms'
import './sound/audio'
import { EMessage } from './system/message'
import { sys } from './system/sys'

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
    universal
  )

const physics = sys
  .start('physics')
  .send(past, future, matter, velocity, size, impact, universal)

timeline.on(($t) => {
  if ($t === undefined) return

  cardinal.send(EMessage.TIMELINE_UPDATE)
  cardinal._queue = []

  physics.send(EMessage.TIMELINE_UPDATE)

  // Rez the player hands
  RezHands(cardinal)
})

voxes.on(($voxes) => {
  cardinal.send($voxes)
})

// @ts-ignore
window.b = {
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
  // voxes goes last as a normal message
  voxes,
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
