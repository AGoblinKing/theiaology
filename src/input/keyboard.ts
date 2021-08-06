import { Value } from 'src/valuechannel'

export const key_down = new Value('')
export const key_up = new Value('')
export const key_map = new Value({})

window.addEventListener('keydown', (e) => {
  // @ts-ignore
  if (e.target.tagName === 'INPUT') {
    return
  }
  key_down.is(e.key)
  key_map.$[e.key] = true
  key_map.poke()
})

window.addEventListener('keyup', (e) => {
  // @ts-ignore
  if (e.target.tagName === 'INPUT') {
    return
  }
  key_up.is(e.key)
  key_map.$[e.key] = false
  key_map.poke()
})
