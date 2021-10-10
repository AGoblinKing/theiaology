import AI from './spell/ai'
import Doing from './spell/do'
import fae from './spell/fae'
import flock from './spell/flock'
import game from './spell/game'
import midi from './spell/noise'
import Phys from './spell/phys'
import pos from './spell/pos'
import rot from './spell/rot'
import shape from './spell/shape'
import theia from './spell/theia'
import thrust from './spell/thrust'
import tome from './spell/tome'
import uni from './spell/uni'
import vox from './spell/vox'

export default Object.assign(
  {},
  AI,
  Phys,
  Doing,
  theia,
  thrust,
  uni,
  fae,
  shape,
  vox,
  flock,
  rot,
  pos,
  midi,
  game,
  tome
)
