import 'src/controller/audio'
import { makeAudioReady, MIDI, Tune } from 'src/controller/audio'
import 'src/controller/player'
import 'src/fate/rez/hand-joints'
// @ts-ignore - tots is a module
import Theiaology from 'src/fate/Theiaology.svelte'
import 'src/input/file'
import * as render from 'src/render'
import 'src/steam'
import { steam } from 'src/steam'
import { modal_location, modal_options, modal_visible } from './fate/editor'
import { key_down } from './input/keyboard'
import { mouse_page } from './input/mouse'

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

document.getElementById('warning').remove()
if (steam.$) {
  makeAudioReady()
} else {
  window.addEventListener('mousedown', makeAudioReady, { once: true })
}

key_down.on((k) => {
  switch (k) {
    case 'F12':
      steam.$?.post('screenshot')
      Tune(25, 15, (i) => {
        if (i % 3 === 0) return
        MIDI(81, 90 + (i % 5), 0.5)
      })

      modal_location.$.set(mouse_page.$.x, mouse_page.$.y)
      modal_visible.set(() => {})
      modal_options.set(['SCREENSHOT TAKEN', 'UPLOADING TO STEAM'])
  }
})
