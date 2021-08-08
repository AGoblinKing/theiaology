import { Uniform } from 'three'
import { Value } from './value'

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
  timeUniform.value = $t
})
