import { Value } from 'src/value/value'

export const url = new Value(window.location.pathname.slice(1).split('/'))
export const hasSharedArrayBuffer = window.SharedArrayBuffer !== undefined

if (hasSharedArrayBuffer) {
  document.body.classList.add('sab')
}
