import { Value } from './value'
interface IGreenworks {
  [key: string]: any
}
export const steam = new Value<IGreenworks>()

// @ts-ignore
if (window.require !== undefined) {
  try {
    steam.set(window.require('greenworks.js'))
    const $s = steam.$
    $s.init()
    $s.SteamStart()
  } catch (ex) {
    console.error(ex)
  }
}

function SteamStart() {
  // do all the things
}

export const steam_open = new Value<string[]>([]).re((arr) => {
  if (arr) {
    const [url, where] = arr
    //steam.$.openURL(url, where)
  }
})
