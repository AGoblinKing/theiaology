import { EShape } from 'src/fate/weave'
import { Plane, Ring } from './simple'

export const ShapeMap = {
  [EShape.Plane]: Plane,
  [EShape.Ring]: Ring,
}
