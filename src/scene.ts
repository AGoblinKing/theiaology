import TimelineScene from 'src/scene/blank'
import DefaultScene from 'src/scene/default'
import RainScene from 'src/scene/rain'
import { url } from './input/browser'

switch (true) {
  case url.$.indexOf('blank') !== -1:
    TimelineScene()
    break
  case url.$.indexOf('kaiju') !== -1:
  case url.$.indexOf('rain') !== -1:
    RainScene()
    break
  default:
    DefaultScene()
}
