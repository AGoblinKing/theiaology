import Theiaology from 'src/timeline/Theiaology.svelte'
import './atoms'
import './audio'
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
import { ReadURL } from './file'
import { url } from './input/browser'
import './player'
import { sys } from './sys'
import { ECardinalMessage } from './system/message'

// // setup systems
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

// sys.start('physics').send(past, future, matter, velocity, scale)

// startup editor
const theiaology = new Theiaology({
  target: document.getElementById('theiaology'),
  props: {},
})

// change theia based on URL
url.on(($url) => {
  ReadURL(`/${$url.join('/')}.theia`)
})
