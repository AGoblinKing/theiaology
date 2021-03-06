import { MIDI } from 'src/controller/audio'
import { looking } from 'src/controller/controls'
import { options } from 'src/input/browser'
import { key_down } from 'src/input/keyboard'
import { mouse_wheel } from 'src/input/mouse'
import { Value } from 'src/value'
import { Vector2 } from 'three'
import { EVar } from './weave'

export const landing_shown = new Value(window.location.pathname === '/')

export const timeline_shown = new Value(options.$.has('DEV'))
export const mirror_shown = new Value(true)

export const modal_location = new Value(new Vector2())
export const modal_options = new Value<string[] | EVar | string>([])
export const modal_default = new Value<any>()
export const modal_visible = new Value<false | ((result: any) => void)>(false)

export const modal_cursor = new Value<number>(0)

let last = false

modal_visible.on((v) => {
  if (v) {
    last = true
    return
  }
  if (v === last) return
  last = false
  MIDI(80, 100, 0.5)
})
key_down.on((k) => {
  switch (k) {
    case 'Escape':
      landing_shown.set(!landing_shown.$)
      if (looking.$ && landing_shown.$) {
        looking.set(false)
      }
      break
    case '`':
    case '~':
      timeline_shown.set(!timeline_shown.$)
  }
})

mouse_wheel.on(() => {
  modal_visible.set(false)
})
