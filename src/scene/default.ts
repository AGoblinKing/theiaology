import { upperAvg } from 'src/audio/audio'
import { ReadURL } from 'src/file'
import { mouse_left, mouse_right } from 'src/input/mouse'
import { doLast, doStatic, Rez, SIZE, Sleeper } from 'src/rez'
import { IBoxRez } from 'src/rez/box'
import { MusicRez } from 'src/rez/music'
import { PlaneOptions, PlaneRez } from 'src/rez/plane'
import { delta } from 'src/time'
import { Euler, Matrix4, Quaternion } from 'three'
const $rot = new Matrix4()
export default () => {
  const MOVE = 2

  const rotMat = new Matrix4().makeRotationFromQuaternion(
    new Quaternion().setFromEuler(new Euler(0.05, -0.05, 0))
  )

  const BOX_SIZE = 20

  const boxOpts: IBoxRez = {
    where: new Matrix4().setPosition(0, -0.5, 0),
    size: BOX_SIZE,
    size2: BOX_SIZE * BOX_SIZE,
    halfsize: (BOX_SIZE / 2) * SIZE,
  }

  const planeOpts = new PlaneOptions(120, true, 4)
  planeOpts.where.setPosition(0, 0, 0)

  const PlaneSleep = new Sleeper()

  doStatic.on(() => {
    boxOpts.where.multiply(rotMat)
    // Rez(BoxRez, BOX_SIZE3, boxOpts)
    Rez(PlaneRez, planeOpts.size2, planeOpts, PlaneSleep)
  })

  const treeM$ = new Matrix4().makeScale(3, 6, 3)
  const stoneM$ = new Matrix4().makeScale(3, 3, 3)
  for (let i = 0; i < 20; i++) {
    ReadURL(
      '/vox/base_dude.vox',
      new Matrix4()
        .makeScale(1, 1.2, 1)
        .multiply($rot.makeRotationY(Math.random() * Math.PI * 2))
        .multiplyScalar(Math.random() * 0.05 + 0.95),
      true,
      Math.random() * 2 - 1
    )
  }

  for (let x = 0; x < 100; x++) {
    ReadURL(
      '/vox/tree.vox',
      treeM$
        .clone()
        .multiply($rot.makeRotationY(Math.random() * Math.PI * 2))
        .multiplyScalar(Math.random() * 0.05 + 0.95),
      true,
      (Math.random() * 2 - 1) * 0.01
    )
  }

  for (let x = 0; x < 50; x++) {
    ReadURL(
      '/vox/path.vox',
      treeM$
        .clone()
        .multiply($rot.makeRotationY(Math.random() * Math.PI * 2))
        .multiplyScalar(Math.random() * 0.05 + 0.95),
      true,
      (Math.random() * 2 - 1) * 0.1
    )
    ReadURL(
      '/vox/stone.vox',
      stoneM$
        .clone()
        .multiply($rot.makeRotationY(Math.random() * Math.PI * 2))
        .multiplyScalar(Math.random() * 0.05 + 0.95),
      true,
      (Math.random() * 2 - 1) * 0.1
    )
  }

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
