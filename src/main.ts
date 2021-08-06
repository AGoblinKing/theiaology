import GNA from 'src/editor/GNA.svelte'
import './audio'
import * as Buffers from './buffer'
import {
  animation,
  future,
  impact,
  matter,
  past,
  scale,
  status,
  timeline,
  velocity,
} from './buffer'
import './file'
import './player'
import './scene'
import { sys } from './sys'
import { ECardinalMessage } from './system/message'

// @ts-ignore
window.b = Buffers

// setup systems
const cardinal = sys
  .start('cardinal')
  .send(
    past,
    future,
    matter,
    velocity,
    scale,
    animation,
    impact,
    status,
    timeline.$
  )

timeline.on(() => {
  cardinal.send(ECardinalMessage.TimelineUpdated)
})

sys.start('physics').send(past, future, matter, velocity, scale)

// startup editor
const gna = new GNA({
  target: document.getElementById('gna'),
  props: {},
})
