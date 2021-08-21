import { universal } from 'src/buffer'
import { Value } from 'src/value/value'
import { Uniform } from 'three'

export const tick = new Value(0)
export const delta = new Value(0)
export const timestamp = new Value(0)

export function Loop($t) {
  delta.set(($t - timestamp.$) / 1000)
  timestamp.set($t)

  tick.set(tick.$ + 1)
}

export const timeUniform = new Uniform(0.0)

timestamp.on(($t) => {
  timeUniform.value = Math.floor(performance.now())

  universal.time(timeUniform.value)
})
