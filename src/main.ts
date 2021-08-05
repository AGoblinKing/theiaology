import './audio'
import {
  animation,
  future,
  impact,
  matter,
  past,
  scale,
  velocity,
} from './component'
import './file'
import './player'
import './scene'
import { sys } from './sys'

sys
  .start('cardinal')
  .send(past, future, matter, velocity, scale, animation, impact)
sys.start('physics').send(past, future, matter, velocity, scale)
