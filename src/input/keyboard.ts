import { Value } from 'src/value'

export const key_down = new Value('')
export const key_up = new Value('')
export const key_map = new Value({})

function bounce(e: KeyboardEvent) {
  return (
    // @ts-ignore
    e.target.tagName === 'INPUT' || e.target.closest('.CodeMirror') !== null
  )
}

window.addEventListener('keydown', (e) => {
  if (bounce(e)) return

  e.preventDefault()
  key_down.set(e.key)
  key_map.$[e.key] = true
  key_map.poke()
})

window.addEventListener('keyup', (e) => {
  if (bounce(e)) return

  key_up.set(e.key)
  key_map.$[e.key] = false
  key_map.poke()
})
