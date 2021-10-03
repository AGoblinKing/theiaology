import { key_down, key_up } from 'src/input/keyboard'
import { middle_mouse_toggle, mouse_left, mouse_right } from 'src/input/mouse'
import { Value } from 'src/value'
import { MIDI, Tune } from './audio'

export const looking = new Value(false).fa(middle_mouse_toggle).re((state) => {
  if (state) document.body.classList.add('looking')
  else document.body.classList.remove('looking')
  MIDI(90, 60 - (state ? 10 : 0), 0.25)
})
// TODO: add me, fa, la, te

export const loading = new Value(false).re((state) => {
  document.body.classList.toggle('loading', state)
})

export const left_forward = new Value(false)
  .re((state) => {
    MIDI(80, 30 - (state ? 10 : 0), 0.9)
  })
  .fa(mouse_left)

export const right_forward = new Value(false)
  .re((state) => {
    MIDI(80, 30 - (state ? 10 : 0), 0.9)
  })
  .fa(mouse_right)

export const forward = new Value(false).la(300, (i) => {})

export const left_grabbed = new Value<number>(undefined)
const MGrab = (state) => {
  // like a gripping noise
  Tune(100, 5, (i) => {
    if (i % 3 === 2) return
    MIDI(81, 40 + (i % 5), 0.6)
  })
}
const MUse = (state) => {
  // like a gripping noise
  Tune(50, 5, (i) => {
    if (i % 3 === 1) return
    MIDI(81, 100 + (i % 5), 0.4)
  })
}

export const left_grab = new Value(false).re(MGrab)
export const right_grab = new Value(false).re(MGrab)
export const left_use = new Value(false).re(MUse)
export const right_use = new Value(false).re(MUse)

key_down.on((k) => {
  switch (k) {
    case '1':
      left_grab.$ === false && left_grab.set(true)
      break
    case '3':
      right_grab.$ === false && right_grab.set(true)
      break
    case 'q':
      left_use.$ === false && left_use.set(true)
      break
    case 'e':
      right_use.$ === false && right_use.set(true)
      break
  }
})

key_up.on((k) => {
  switch (k) {
    case '1':
      left_grab.set(false)
      break
    case '3':
      right_grab.set(false)
      break
    case 'q':
      left_use.set(false)
      break
    case 'e':
      right_use.set(false)
      break
  }
})
