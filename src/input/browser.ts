import { dotTheia } from 'src/config'
import { steam, steam_open } from 'src/steam'
import { Value } from 'src/value'

export const url = new Value(
  decodeURI(window.location.pathname).slice(1).split('/')
)

export const pathname = new Value('').fa(url, (v) => {
  const val = v.join('/')
  return val === '' ? '/' : val
})

export const hasSharedArrayBuffer = window.SharedArrayBuffer !== undefined

export const history = new Value([]).save('history')
export const favorites = new Value([]).save('favorites')
export const isFavorite = new Value(false).fa(
  favorites,
  (f) => f.indexOf(pathname.$) !== -1
)
export const curated = dotTheia

if (hasSharedArrayBuffer) {
  document.body.classList.add('sab')
}

export const mobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

export const options = new Value(
  new Set(window.location.search.toUpperCase().slice(1).split('|'))
)

export const isVR = new Value(false)
// @ts-ignore
navigator.xr?.isSessionSupported('immersive-vr').then(function (supported) {
  isVR.set(supported)
})

export const multiplayer = window.location.hash.slice(1)

export const isQuest =
  navigator.userAgent.indexOf('OculusBrowser') !== -1 ||
  navigator.userAgent.indexOf('Android') !== -1

export const browserOpen = new Value<string[]>().re((arr) => {
  if (!arr) return

  const [url, where] = arr

  if (steam.$) steam_open.set([url, where])
  else window.open(url, where)
})

const hix = history.$.indexOf(pathname.$)
if (hix !== -1) {
  history.$.splice(hix, 1)
}

history.$.push(pathname.$)
history.$.splice(0, history.$.length - 5)
history.poke()

export function Pin() {
  const idx = favorites.$.indexOf(pathname.$)
  if (idx === -1) {
    favorites.$.push(pathname.$)
  } else {
    favorites.$.splice(idx, 1)
  }

  favorites.poke()
}
