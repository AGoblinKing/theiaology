import { timeline } from 'src/buffer'
import { cursor } from 'src/timeline/nav'
import { Value } from 'src/value/value'

export const clip = new Value([0, 0, 0, 0, 0, 0])

export function Copy() {
  if (cursor.$.i === undefined) return

  clip.$[0] = timeline.$.when(cursor.$.i)
  clip.$[1] = timeline.$.command(cursor.$.i)
  clip.$[2] = timeline.$.who(cursor.$.i)
  clip.$[3] = timeline.$.data0(cursor.$.i)
  clip.$[4] = timeline.$.data1(cursor.$.i)
  clip.$[5] = timeline.$.data2(cursor.$.i)
}

export function Paste() {
  if (cursor.$.i === undefined) return

  // get data from cursor
  clip[2] = timeline.$.who(cursor.$.i)

  // @ts-ignore
  timeline.$.add(...clip.$)
  timeline.poke()
}

export function Cut() {
  if (cursor.$.i === undefined) return
  Copy()

  timeline.$.free(cursor.$.i)
  timeline.poke()
}
