import { Value } from './value'

interface IGreenworks extends EventTarget {
  saves: []
  workshop: []
  post: (data) => void
}
// @ts-ignore
export const steam = new Value<IGreenworks>(window.steam)

export const steam_open = new Value<string[]>([]).re((arr) => {
  if (!arr || !steam.$) return
  const [url, where] = arr

  if (where === '_self') {
    window.open(url, '_self')
    return
  }

  steam.$.post(`open|${url}|${where}`)
})
