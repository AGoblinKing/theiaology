import { EShape } from 'src/fate/weave'
import { Plane, Ring } from './simple'

export const ShapeMap = {
  [EShape.PLANE]: Plane,
  [EShape.RING]: Ring,
}
