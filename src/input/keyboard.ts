import { renderer } from 'src/render'
import { Value } from 'src/store'

export const key_down = new Value('')
export const key_up = new Value('')
export const key_map = new Value({})

const $c = renderer.domElement

$c.addEventListener('keydown', (e) => {
  key_down.is(e.key)
  key_map.$[e.key] = true
  key_map.poke()
})

$c.addEventListener('keyup', (e) => {
  key_up.is(e.key)
  key_map.$[e.key] = false
  key_map.poke()
})
