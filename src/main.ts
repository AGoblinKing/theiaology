import './audio/audio'
import { future, matter, past, velocity } from './buffer'
import './file'
import './player'
import './scene'
import { sys } from './sys/sys'

sys.start('physics').send(past, future, matter, velocity)
