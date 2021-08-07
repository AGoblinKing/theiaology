import { key_down } from 'src/input/keyboard'
import { mouse_wheel } from 'src/input/mouse'
import { Value } from 'src/valuechannel'
import { Vector2 } from 'three'

export const timeline_shown = new Value(
  `${window.location.hash}`.indexOf('dev') !== -1
)

export const modal_location = new Value(new Vector2())
export const modal_options = new Value([])
export const modal_visible = new Value<false | ((result: string) => void)>(
  false
)

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
