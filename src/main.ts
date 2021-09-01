// @ts-ignore - tots is a module
import 'src/file/file'
import * as render from 'src/render/render'
import Theiaology from 'src/timeline/Theiaology.svelte'
import './controller/player'
import './rez/hand-joints'
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
