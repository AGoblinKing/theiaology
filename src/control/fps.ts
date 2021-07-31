import { key_down, key_up } from 'src/input/keyboard'
import { Value } from 'src/store'
import { renderer } from '../render'
import { delta } from '../time'
import './hand'

export const move_inputs = new Value({ forward: 0, side: 0 })

key_up.on(($k) => {
  switch ($k) {
    case 'a':
      move_inputs.$.side = -1
      break
    case 'd':
      move_inputs.$.side = 1
      break
    case 'w':
      move_inputs.$.forward = -1
      break
    case 's':
      move_inputs.$.forward = -1
      break
  }
})

key_down.on(($k) => {
  switch ($k) {
    case 'a':
    case 'd':
      move_inputs.$.side = 0
      break
    case 'w':
    case 's':
      move_inputs.$.forward = 0
      break
  }
})

delta.on(($dt) => {
  // only run not in VR
  if (renderer.xr.isPresenting) return
})
