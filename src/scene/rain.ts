import { audio, upperAvg } from 'src/audio/audio'
import { ReadURL } from 'src/file'
import { mouse_left, mouse_right } from 'src/input/mouse'
import { doLast, doStatic, Rez, Sleeper } from 'src/rez'
import { MusicRez } from 'src/rez/music'
import { PlaneOptions, PlaneRez } from 'src/rez/plane'
import { delta } from 'src/time'
import { Color, Matrix4 } from 'three'
const MOVE = 3

const $rot = new Matrix4()
// experiment with raining blobs
export default () => {
  audio.src = '/music/glide_or_die.mp3'
  audio.load()

  const planeOpts = new PlaneOptions(150, true, 20, new Color('gray'))
  const planeSleep = new Sleeper()
  const $m = new Matrix4().makeScale(30, 50, 30)
  const $dude = new Matrix4().makeScale(1, 1.2, 1)
  const $car = new Matrix4().makeScale(4, 3, 4).setPosition(0, 0.25, 0)

  for (let x = 0; x < 30; x++) {
    ReadURL('/vox/building.vox', $m, true, 0.1 * (Math.random() * 2 - 1))
  }

  for (let i = 0; i < 40; i++) {
    ReadURL(
      '/vox/base_dude.vox',
      $dude
        .clone()
        .multiply($rot.makeRotationY(Math.random() * Math.PI * 2))
        .multiplyScalar(Math.random() * 0.05 + 0.95),
      true,
      Math.random() * 2 - 1
    )
    ReadURL(
      '/vox/car.vox',
      $car
        .clone()
        .multiply($rot.makeRotationY(Math.random() * Math.PI * 2))
        .multiplyScalar(Math.random() * 0.05 + 0.95),
      true,
      Math.random() * 2 - 1
    )
  }

  doStatic.on(() => {
    // Rez(BoxRez, BOX_SIZE3, boxOpts)
    Rez(PlaneRez, planeOpts.size2, planeOpts, planeSleep)
  })

  const musicData = {
    mv: 0,
    mv2: 0,
    divisor: 0,
  }

  const sleepMusic = new Sleeper()

  doLast.on(() => {
    musicData.mv = MOVE * delta.$ * upperAvg.$
    musicData.mv2 = musicData.mv / 2
    musicData.divisor = mouse_left.$ ? 0.99 : mouse_right.$ ? 1.01 : 0.9999

    Rez(MusicRez, 100000, musicData, sleepMusic)
  })
}
