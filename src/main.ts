import Theiaology from 'src/timeline/Theiaology.svelte'
import './atoms'
import './audio'
import * as Buffers from './buffer'
import './file'
import { ReadURL } from './file'
import { url } from './input/browser'
import './player'

// @ts-ignore
window.b = Buffers

// // setup systems
// const cardinal = sys
//   .start('cardinal')
//   .send(
//     past,
//     future,
//     matter,
//     velocity,
//     scale,
//     animation,
//     impact,
//     status,
//     timeline.$
//   )

// timeline.on(() => {
//   cardinal.send(ECardinalMessage.TimelineUpdated)
// })

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
