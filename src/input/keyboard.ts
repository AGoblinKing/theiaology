import { Value } from 'src/value'

export const key_down = new Value('')
export const key_up = new Value('')
export const key_map = new Value({})

window.addEventListener('keydown', (e) => {
  // @ts-ignore
  if (e.target.tagName === 'INPUT') {
    return
  }
  e.preventDefault()
  key_down.set(e.key)
  key_map.$[e.key] = true
  key_map.poke()
})

window.addEventListener('keyup', (e) => {
  // @ts-ignore
  if (e.target.tagName === 'INPUT') {
    return
  }
  key_up.set(e.key)
  key_map.$[e.key] = false
  key_map.poke()
})
