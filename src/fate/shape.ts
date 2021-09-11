import { EShape } from 'src/fate/enum_fate'
import { Plane, Ring } from './simple'

export const ShapeMap = {
  [EShape.Plane]: Plane,
  [EShape.Ring]: Ring,
}
