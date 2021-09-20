import AI from './spell/ai'
import { default as pos, default as rez } from './spell/do'
import flock from './spell/flock'
import Phys from './spell/phys'
import rot from './spell/rot'
import shape from './spell/shape'
import theia from './spell/theia'
import thrust from './spell/thrust'
import uni from './spell/uni'
import user from './spell/user'
import vox from './spell/vox'

export default Object.assign(
  {},
  AI,
  Phys,
  pos,
  rez,
  theia,
  thrust,
  uni,
  user,
  shape,
  vox,
  flock,
  rot
)
