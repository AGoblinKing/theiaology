import { Value } from 'src/valuechannel'

export const timeline_shown = new Value(
  `${window.location}`.indexOf('localhost') !== -1
)
