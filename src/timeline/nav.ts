import { key_down, key_map } from 'src/input/keyboard'
import { Value } from 'src/value'
import { timeline_shown } from './editor'

export let navs = {}
export const doclick = new Value(false)

export function AttemptNav(dir: 'up' | 'down' | 'left' | 'right') {
  if (!cursor.$[dir]) return
  const attempts = cursor.$[dir].split('|')
  for (let attempt of attempts) {
    if (!navs[attempt]) continue
    cursor.set(navs[attempt])
    return
  }
}
// @ts-ignore
window.navs = navs
key_down.on((k) => {
  if (!timeline_shown.$) return

  switch (k) {
    case 'e':
    case 'Enter':
    case 'i':
      doclick.set(true)
      break
    case 'r':
    case 'ArrowUp':
    case 'j':
      AttemptNav('up')
      break
    case 'f':
    case 'ArrowDown':
    case 'k':
      AttemptNav('down')
      break
    case 'q':
    case 'ArrowLeft':
    case 'l':
      AttemptNav('left')
      break
    case 'ArrowRight':
    case ';':
      AttemptNav('right')
      break
    case 'Tab':
      AttemptNav(key_map.$['Shift'] ? 'left' : 'right')
      break
  }
})

export interface INav {
  left?: string
  up?: string
  right?: string
  down?: string
  tag: string
  i?: number
}

export const cursor = new Value<INav>({
  right: 'workspace',
  down: 'music|vox|root',
  tag: 'theiaology',
})
