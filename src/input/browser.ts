import { Value } from 'src/valuechannel'

export const url = new Value(window.location.pathname.slice(1).split('/'))
