import { Color } from 'three'

export const stringToColor = (str) => hashcode(str) % 0xffffff
export const hashcode = (str) => {
  str = str || ' '
  let hash = 0,
    i,
    chr

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }

  return Math.abs(hash)
}

const $col = new Color()

export const faintColor = (str) => {
  return `rgba(${$col.set(stringToColor(str)).r}, ${$col.g}, ${$col.b}, 0.25)`
}
