import { EShape } from 'src/timeline/def-timeline'
import { Plane, Ring } from './simple'

export const ShapeMap = {
  [EShape.Plane]: Plane,
  [EShape.Ring]: Ring,
}
