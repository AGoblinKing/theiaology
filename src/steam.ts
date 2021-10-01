import { loading } from './controller/controls'
import { Value } from './value'

interface ISteam extends EventTarget {
  saves: any[]
  workshop: any[]
  post: (data: string) => void
}

// @ts-ignore
export const steam = new Value<ISteam>(window.steam)

export const steam_open = new Value<string[]>([]).re((arr) => {
  if (!arr || !steam.$) return
  const [url, where] = arr
  if (!url) return

  if (where === '_self' || true) {
    window.open(url, '_self')
    return
  }

  steam.$.post(`open|${url}|${where}`)
})

if (steam.$) {
  steam.$.addEventListener('message', (e) => {
    const [command, ...args] = e.data.split('|')
    switch (command) {
      case 'ugcResult':
        loading.set(false)
        break
    }

    console.log(e.data)
  })
}
