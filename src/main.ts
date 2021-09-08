import 'src/input/file'
import * as render from 'src/render/render'
// @ts-ignore
import Theiaology from 'src/timeline/Theiaology.svelte'
import './controller/player'
import './render/hand-joints'
import './sound/audio'

// startup editor
const theiaology = new Theiaology({
  target: document.getElementById('theiaology'),
  props: {},
})

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service.js', { scope: '/' })
}

Object.assign(window, { render })
