// @ts-ignore - tots is a module
import 'src/input/file'
import * as render from 'src/render/render'
import Theiaology from 'src/timeline/Theiaology.svelte'
import './controller/player'
import './realm/multiplayer'
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
