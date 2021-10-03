import 'src/controller/audio'
import { Chirp, makeAudioReady } from 'src/controller/audio'
import 'src/controller/player'
import 'src/fate/rez/hand-joints'
// @ts-ignore - tots is a module
import Theiaology from 'src/fate/Theiaology.svelte'
import 'src/input/file'
import 'src/input/phony'
import * as render from 'src/render'
import 'src/steam'
import { steam } from 'src/steam'
import { loading } from './controller/controls'
import { modal_location, modal_options, modal_visible } from './fate/editor'
import { key_down, key_map } from './input/keyboard'
import { Load } from './input/load'
import { mouse_page } from './input/mouse'
import { Screenshot } from './input/save'
import { first } from './realm'

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
    case 'p':
      if (!key_map.$['Control']) return
    case 'F12':
      if (steam.$) {
        steam.$.post('screenshot')
      } else {
        Screenshot()
      }

      Chirp()

      modal_location.$.set(mouse_page.$.x, mouse_page.$.y)
      modal_visible.set(() => {})
      modal_options.set([
        'SCREENSHOT TAKEN',
        steam.$ ? 'UPLOADING TO STEAM' : 'DOWNLOADING',
      ])
  }
})

if (steam.$) {
  steam.$.addEventListener('message', (e) => {
    const [command, ...args] = e.data.split('|')
    switch (command) {
      case 'fate':
        const b = args.join('|')
        const buf = new ArrayBuffer(b.length)
        for (let i = 0; i < b.length; i++) {
          buf[i] = b.charCodeAt(i)
        }

        Load(buf, first.$)

        break
      case 'list':
        modal_options.set(args)
        modal_visible.set((opt) => {
          steam.$.post(`fate|${opt}`)
        })
        modal_location.$.copy(mouse_page.$)

        break
      case 'ugcResult':
        loading.set(false)
        break
      default:
        console.log(e.data)
    }
  })
}
