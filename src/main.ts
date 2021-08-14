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
  velocity,
} from './buffer'
import { voxes } from './buffer/vox'
import './controller/player'
import { RezHands } from './rez/hand-joints'
import './shader/atoms'
import './sound/audio'
import { ECardinalMessage } from './system/message'
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
    timeline.$
  )

timeline.on(($t) => {
  if ($t === undefined) return

  cardinal.send(ECardinalMessage.TimelineUpdated)
  // clear queue of replies
  cardinal._queue = []

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
  scale: size,
  animation,
  impact,
  status,
  timeline,
  voxes,
}
// sys.start('physics').send(past, future, matter, velocity, scale)

// startup editor
const theiaology = new Theiaology({
  target: document.getElementById('theiaology'),
  props: {},
})

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service.js', { scope: '/' })
}
