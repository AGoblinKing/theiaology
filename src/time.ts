import { Uniform } from 'three'
import { Value } from './valuechannel'

export const tick = new Value(0)
export const delta = new Value(0)
export const timestamp = new Value(0)

export function Loop($t) {
  delta.is(($t - timestamp.$) / 1000)
  timestamp.is($t)

  tick.is(tick.$ + 1)
}

export const timeUniform = new Uniform(0.0)
timestamp.on(($t) => {
  timeUniform.value = $t
})

// timing functions
export const doRez = new Value(0)
export const doStatic = new Value(undefined)
export const doLast = new Value(undefined)
