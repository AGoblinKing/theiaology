import { Value } from 'src/store'

export const url = new Value(window.location.pathname.slice(1).split('/'))
