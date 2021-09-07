import { options } from 'src/input/browser'
import { key_down } from 'src/input/keyboard'
import { mouse_wheel } from 'src/input/mouse'
import { Value } from 'src/value'
import { Vector2 } from 'three'
import { EVar } from './def-timeline'

export const timeline_shown = new Value(options.$.has('DEV'))

export const modal_location = new Value(new Vector2())
export const modal_options = new Value<string[] | EVar | string>([])
export const modal_default = new Value<any>()
export const modal_visible = new Value<false | ((result: any) => void)>(false)

export const modal_cursor = new Value<number>(0)

key_down.on((k) => {
  switch (k) {
    case '`':
    case '~':
      timeline_shown.set(!timeline_shown.$)
  }
})

mouse_wheel.on(() => {
  modal_visible.set(false)
})
