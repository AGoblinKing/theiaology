import { middle_mouse_toggle, mouse_left, mouse_right } from 'src/input/mouse'
import { Value } from 'src/value'
import { MIDI } from './audio'

export const looking = new Value(false).fa(middle_mouse_toggle).re((state) => {
  if (state) document.body.classList.add('looking')
  else document.body.classList.remove('looking')
  MIDI(90, 60 - (state ? 10 : 0), 0.5)
})
// TODO: add me, fa, la, te

export const loading = new Value(false).re((state) => {
  document.body.classList.toggle('loading', state)
})

export const left_forward = new Value(false)
  .re((state) => {
    MIDI(80, 30 - (state ? 10 : 0), 0.5)
  })
  .fa(mouse_left)

export const right_forward = new Value(false)
  .re((state) => {
    MIDI(80, 30 - (state ? 10 : 0), 0.5)
  })
  .fa(mouse_right)

export const forward = new Value(false).la(300, (i) => {})
