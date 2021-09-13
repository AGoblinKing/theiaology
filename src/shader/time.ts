import { Value } from 'src/value'
import { Uniform } from 'three'

export const tick = new Value(0)
export const delta = new Value(0)
export const timing = new Value(0)

export function Loop($t) {
  delta.set(($t - timing.$) / 1000)
  timing.set($t)

  tick.set(tick.$ + 1)
}

export const timeUniform = new Uniform(0.0)
timing.on(($t) => {
  timeUniform.value = Math.floor(performance.now())
})

export function Timer(timeout: number, fn: () => void) {
  const intv = setInterval(fn, timeout)

  return () => clearInterval(intv)
}
