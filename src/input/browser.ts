import { Value } from 'src/value'

export const url = new Value(window.location.pathname.slice(1).split('/'))

export const local = window.location.host.indexOf('localhost') > -1

export const hasSharedArrayBuffer = window.SharedArrayBuffer !== undefined

if (hasSharedArrayBuffer) {
  document.body.classList.add('sab')
}

export const mobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

export const options = new Value(
  new Set(window.location.hash.toUpperCase().slice(1).split('|'))
)

export const multi = new Value(window.location.search.slice(1))
