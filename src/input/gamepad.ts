// updates inputs for gamepad
// eventually will want to support local multiplayer with this
// piping input to an alias map to a controller's actions

import { key_down, key_up } from 'src/input/keyboard'
import { Value } from 'src/value/value'

export const pad_axes = new Value({
  lefthorizontal: 0,
  leftvertical: 0,
  rightvertical: 0,
  righthorizontal: 0,
})

export const sensitivity = new Value(0.09)
export const pads_disabled = new Value({})
export const pads = new Value({})

export const pads_activate = new Value(-1).on((i) => {
  if (i < 0) return
  delete pads_disabled.$[i]
  pads_disabled.poke()
})
export const pad_disable = new Value(-1).on((i) => {
  if (i < 0) return

  pads_disabled.$[i] = true
  pads_disabled.poke()
})

export const pad_down = new Value(-1)
export const pad_up = new Value(-1)
export const pad = new Value({})

export const pad_connected = new Value(true)

pads.on(
  ($pads) =>
    !pad_connected.$ && pad_connected.set(Object.keys($pads).length > 0)
)

window.addEventListener(`gamepadconnected`, ({ gamepad }: any) => {
  pads.$[gamepad.index] = gamepad
  pads.poke()
})

window.addEventListener(`gamepaddisconnected`, ({ gamepad }: any) => {
  delete pads.$[gamepad.index]
  pads.poke()
})

export const xbox = {
  0: `a`,
  1: `b`,
  2: `x`,
  3: `y`,
  4: `leftshoulder`,
  5: `rightshoulder`,
  6: `lefttrigger`,
  7: `righttrigger`,
  8: `select`,
  9: `start`,
  10: `leftstick`,
  11: `rightstick`,
  12: `up`,
  13: `down`,
  14: `left`,
  15: `right`,
}
// analogs that will require
export const AXIS = {
  0: `lefthorizontal`,
  1: `leftvertical`,
  2: `righthorizontal`,
  3: `rightvertical`,
}

export const input_map = {
  a: 'Enter',
  b: 'Escape',
  start: '~',

  left: 'ArrowLeft',
  right: 'ArrowRight',
  down: 'ArrowDown',
  up: 'ArrowUp',
  leftshoulder: 'f',
  rightshoulder: 'r',
  leftrigger: 'Shift',
}
let last_dirty = false
setInterval(() => {
  const $ps = pad.$

  let changes = 0

  for (let gpad of navigator.getGamepads()) {
    if (!gpad) continue

    if (pads_disabled.$[gpad.index]) continue
    for (let i = 0; i < gpad.buttons.length; i++) {
      const state = gpad.buttons[i].pressed || gpad.buttons[i].touched
      if ($ps[i] !== state) {
        changes++

        if (state) {
          pad_down.set(i)
        } else {
          pad_up.set(i)
        }
      }
    }

    //axis
    const $ax = pad_axes.$
    for (let i = 0; i < gpad.axes.length; i++) {
      if (Math.abs(gpad.axes[i]) > sensitivity.$) {
        changes++
        $ax[i] = gpad.axes[i]
        $ax[AXIS[i]] = gpad.axes[i]
      } else if (last_dirty) {
        $ax[i] = 0
        $ax[AXIS[i]] = 0
        pad_axes.poke()
      }
    }
  }

  if (changes > 0) {
    pad.poke()
    pad_axes.poke()
    last_dirty = true
  } else {
    last_dirty = false
  }
}, 100)

pad_down.on((i) => {
  if (i === -1) return

  const $p = pad.$
  const k = xbox[i]

  $p[k] = $p[i] = true

  const input = input_map[k]

  if (input === undefined) return

  key_down.set(input)
})

pad_up.on((i) => {
  if (i === -1) return

  const $p = pad.$
  const k = xbox[i]

  $p[i] = false
  $p[xbox[i]] = false

  const input = input_map[k]

  if (input === undefined) return

  key_up.set(input)
})
