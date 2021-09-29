import { middle_mouse_toggle } from 'src/input/mouse'
import { Value } from 'src/value'

export const looking = new Value(false)
  .do(() => middle_mouse_toggle.on(() => looking.set(!looking.$)))
  .re((state) => {
    document.body.classList.toggle('looking', state)
  })
// TODO: add me, fa, la, te

export const loading = new Value(false).re((state) => {
  document.body.classList.toggle('loading', state)
})
