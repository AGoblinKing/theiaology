import DefaultScene from 'src/scene/default'
import RainScene from 'src/scene/rain'
import { url } from './input/browser'

switch (true) {
  case url.$.indexOf('rain') !== -1:
    RainScene()
    break
  default:
    DefaultScene()
}
