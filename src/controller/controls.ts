import { key_down, key_up } from 'src/input/keyboard'
import { middle_mouse_toggle, mouse_left, mouse_right } from 'src/input/mouse'
import { Value } from 'src/value'
import { Euler } from 'three'
import { MIDI } from './audio'

const _euler = new Euler()
const _PI_2 = Math.PI / 2
export const looking = new Value(false).fa(middle_mouse_toggle).re((state) => {
  if (state) document.body.classList.add('looking')
  else document.body.classList.remove('looking')

  // if (state) {
  //   renderer.domElement.requestPointerLock()
  // } else {
  //   renderer.domElement.ownerDocument.exitPointerLock()
  // }

  MIDI(90, 60 - (state ? 10 : 0), 0.25)
})

// renderer.domElement.ownerDocument.addEventListener('mousemove', (event) => {
//   if (!looking.$) return

//   // feed as mouse coords for the smooth cam

//   const movementX =
//     // @ts-ignore
//     event.movementX || event.mozMovementX || event.webkitMovementX || 0

//   const movementY =
//     // @ts-ignore
//     event.movementY || event.mozMovementY || event.webkitMovementY || 0
//   mouse_pos.$.set(movementX, -movementY).multiplyScalar(0.01)
// })
// TODO: add me, fa, la, te

export const loading = new Value(false).re((state) => {
  document.body.classList.toggle('loading', state)
})

export const left_forward = new Value(false)
  .re((state) => {
    MIDI(80, 30 - (state ? 10 : 0), 0.32)
  })
  .fa(mouse_left)

export const right_forward = new Value(false)
  .re((state) => {
    MIDI(80, 30 - (state ? 10 : 0), 0.32)
  })
  .fa(mouse_right)

export const left_grabbed = new Value<number>(undefined)

export const left_grab = new Value(false)

export const right_grab = new Value(false)
export const left_use = new Value(false)
export const right_use = new Value(false)

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
