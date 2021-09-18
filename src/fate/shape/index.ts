import { EShape } from 'src/fate/weave'
import { Plane, Rectangle, Ring } from './simple'

export const ShapeMap = {
  [EShape.PLANE]: Plane,
  [EShape.RING]: Ring,
  [EShape.RECT]: Rectangle,
}
