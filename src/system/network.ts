// network the raw buffers over websockets

import { Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Universal } from 'src/buffer/universal'
import { System } from './system'

//
class Network extends System {
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  size: Size
  animation: Animation
  universal: Universal
}
