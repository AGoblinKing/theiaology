import { upperAvg } from 'src/audio'
import { animation } from 'src/buffer'
import { EAnimation } from 'src/buffer/animation'
import { Asset, ReadURL } from 'src/file'
import { mouse_left, mouse_right } from 'src/input/mouse'
import { MagickaVoxel } from 'src/magica'
import { Rez, SIZE, Sleeper } from 'src/rez'
import { IBoxShape } from 'src/shape/box'
import { MusicShape } from 'src/shape/music'
import { PlaneOptions, PlaneShape } from 'src/shape/plane'
import { Voxel, voxels_static } from 'src/shape/vox'
import { delta, doLast, doStatic } from 'src/time'
import { Euler, Matrix4, Object3D, Quaternion } from 'three'
const $rot = new Matrix4()
export default () => {
  const MOVE = 2

  const rotMat = new Matrix4().makeRotationFromQuaternion(
    new Quaternion().setFromEuler(new Euler(0.05, -0.05, 0))
  )

  const BOX_SIZE = 20

  const boxOpts: IBoxShape = {
    where: new Matrix4().setPosition(0, -0.5, 0),
    size: BOX_SIZE,
    size2: BOX_SIZE * BOX_SIZE,
    halfsize: (BOX_SIZE / 2) * SIZE,
  }

  const planeOpts = new PlaneOptions(120, true, 4)
  planeOpts.where.setPosition(0, 0, 0)

  const bigPlane = new PlaneOptions(5, true, 1000)
  bigPlane.where.setPosition(0, -0.3, 0)
  const skyPlane = new PlaneOptions(6, true, 20000)
  skyPlane.color.setRGB(0, 0.5, 1)
  skyPlane.where.setPosition(0, 4000, 0)

  const PlaneSleep = new Sleeper()

  const treeM$ = new Matrix4().makeScale(3, 6, 3)
  const stoneM$ = new Matrix4().makeScale(3, 3, 3)
  const castleM$ = new Matrix4().makeScale(10, 20, 10)

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
  for (let i = 0; i < 20; i++) {
    ReadURL(
      '/vox/sheepdogbark.vox',
      new Matrix4()
        .makeScale(1, 1.2, 1)
        .multiply($rot.makeRotationY(Math.random() * Math.PI * 2))
        .multiplyScalar(Math.random() + 0.95),
      true,
      (Math.random() * 2 - 1) * 0.25
    )
  }
  for (let i = 0; i < 50; i++) {
    ReadURL(
      '/vox/tree.vox',
      treeM$,

      true,
      (Math.random() * 2 - 1) * 0.05
    )
  }

  for (let i = 0; i < 10; i++) {
    ReadURL(
      '/vox/castle.vox',
      castleM$,

      true,
      Math.random() * 2 - 1
    )
  }
  for (let i = 0; i < 50; i++) {
    ReadURL(
      '/vox/bush.vox',
      treeM$,

      true,
      (Math.random() * 2 - 1) * 0.1
    )
  }

  for (let i = 0; i < 7; i++) {
    Asset('/vox/stairs.vox', (asset: ArrayBuffer) => {
      // TODO: maybe do some sprite color pallete shifting to create a water effect in the distance

      const $o3d = new Object3D()
      $o3d.scale.set(2, 1, 2).multiplyScalar(100)
      $o3d.position.set(Math.sin(i * 2) * 150, 0, Math.cos(i * 2) * 150)
      $o3d.lookAt(0, 0, 0)
      $o3d.rotateY(Math.PI / 2)
      $o3d.updateMatrix()
      voxels_static.push(new Voxel($o3d.matrix, new MagickaVoxel(asset)))
    })
  }

  for (let i = 0; i < 11; i++) {
    Asset('/vox/stairs.vox', (asset: ArrayBuffer) => {
      // TODO: maybe do some sprite color pallete shifting to create a water effect in the distance

      const $o3d = new Object3D()
      $o3d.scale.set(2, 1, 2).multiplyScalar(50)
      $o3d.position.set(Math.sin(i * 5) * 100, 0, Math.cos(i * 5) * 100)
      $o3d.lookAt(0, 0, 0)
      $o3d.rotateY(Math.PI / 2)
      $o3d.updateMatrix()
      voxels_static.push(new Voxel($o3d.matrix, new MagickaVoxel(asset), 0.5))
    })
  }

  for (let i = 0; i < 50; i++) {
    ReadURL('/vox/path.vox', treeM$, true, (Math.random() * 2 - 1) * 0.1)
    ReadURL('/vox/stone.vox', stoneM$, true, (Math.random() * 2 - 1) * 0.1)
  }

  const musicData = {
    mv: 0,
    mv2: 0,
    divisor: 0,
  }

  const sleepMusic = new Sleeper()

  const groundSleep = new Sleeper()
  const skySleep = new Sleeper()

  function NoEffectPlane(...args) {
    animation.store(args[3], EAnimation.NoEffects)
    return PlaneShape.apply(undefined, args)
  }

  doStatic.on(() => {
    boxOpts.where.multiply(rotMat)
    // Rez(BoxRez, BOX_SIZE3, boxOpts)
    Rez(PlaneShape, planeOpts.size2, planeOpts, PlaneSleep)

    Rez(NoEffectPlane, bigPlane.size2, bigPlane, groundSleep)
    Rez(NoEffectPlane, skyPlane.size2, skyPlane, skySleep)
  })

  doLast.on(() => {
    musicData.mv = MOVE * delta.$ * upperAvg.$
    musicData.mv2 = musicData.mv / 2
    musicData.divisor = mouse_left.$ ? 0.99 : mouse_right.$ ? 1.01 : 0.9999

    Rez(MusicShape, 100000, musicData, sleepMusic)
  })
}
