import Theiaology from 'src/timeline/Theiaology.svelte'
import './audio'
import * as Buffers from './buffer'
import './file'
import { ReadURL } from './file'
import { url } from './input/browser'
import './player'
import './scene'

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

// change audio source based on URL
url.on(($url) => {
  switch ($url[0]) {
    case 'music':
      ReadURL(`/music/${$url[1]}.mp3`)
      break
    default:
      ReadURL(`/music/excellet.mp3`)
  }
})
