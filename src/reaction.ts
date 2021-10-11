import { Chirp, makeAudioReady, MIDI, Tune } from 'src/controller/audio'
import { steam } from 'src/steam'
import { audio, audio_buffer, audio_name } from './controller/audio'
import {
  left_grab,
  left_use,
  loading,
  right_grab,
  right_use,
} from './controller/controls'
import { modal_location, modal_options, modal_visible } from './fate/editor'
import { key_down, key_map } from './input/keyboard'
import { Load } from './input/load'
import { mouse_page } from './input/mouse'
import { Screenshot } from './input/save'
import { fantasy, first, Realm } from './realm'
import { timeUniform } from './shader/time'
import { Value } from './value'

let cancels

export const sensed = new Value({})
export const sense_found = new Value<number>()
export const sense_lost = new Value<number>()

fantasy.on((realm: Realm) => {
  if (!realm) return

  if (cancels) cancels.forEach((c) => c())

  cancels = [
    realm.fate.on(() => {
      if (!realm.musicBuffer) return

      const playing = !audio.paused

      audio.src = realm.musicString
      timeUniform.value = audio.currentTime = realm.universal.musicTime()

      playing && audio.play()

      if (realm.first) {
        audio_name.set(realm.musicName)
        audio_buffer.set(realm.musicBuffer)
      }
    }),
  ]
})

// lets try naive approach and play sound when they enter our hearing range
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
  steam.$.post('update')
  setInterval(() => {
    steam.$.post('update')
  }, 5 * 60 * 1000)
}

const MGrab = (state) => {
  // like a gripping noise
  Tune(100, 5, (i) => {
    if (i % 3 === 2) return
    MIDI(81, 40 + (i % 5), 0.32)
  })
}
const MUse = (state) => {
  // like a gripping noise
  Tune(50, 5, (i) => {
    if (i % 3 === 1) return
    MIDI(81, 100 + (i % 5), 0.31)
  })
}
left_grab.re((state) => {
  MGrab(state)
  first.$.input.grabbing(state)
})

right_grab.re((state) => {
  MGrab(state)
  first.$.input.grabbingRight(state)
})
left_use.re((state) => {
  MUse(state)
  first.$.input.pinching(state)
})

right_use.re((state) => {
  MUse(state)
  first.$.input.pinchingRight(state)
})

window.addEventListener(
  'mousedown',
  () => {
    makeAudioReady()
  },
  { once: true }
)
