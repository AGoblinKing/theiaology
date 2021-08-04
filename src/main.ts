import './audio/audio'
import { future, matter, past, scale, velocity } from './component'
import './file'
import './player'
import './scene'
import { sys } from './sys'

sys.start('physics').send(past, future, matter, velocity, scale)
