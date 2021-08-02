import {
  AmbientLight,
  DirectionalLight,
  Euler,
  Matrix4,
  Quaternion,
} from 'three'
import { upperAvg } from './audio/audio'
import { ReadURL } from './file'
import { mouse_left, mouse_right } from './input/mouse'
import { scene } from './render'
import { doLast, doStatic, meshes, Rez, SIZE, Sleeper } from './rez'
import { IBoxRez } from './rez/box'
import { MusicRez } from './rez/music'
import { PlaneOptions, PlaneRez } from './rez/plane'
import { delta } from './time'

const MOVE = 2

const rotMat = new Matrix4().makeRotationFromQuaternion(
  new Quaternion().setFromEuler(new Euler(0.05, -0.05, 0))
)

const under = new AmbientLight(0xffffff, 0.5)
const over = new DirectionalLight(0xffffff, 1)
over.position.set(0, 1, 1)

scene.$.add(meshes.$, over, under)

const BOX_SIZE = 20
const BOX_SIZE3 = BOX_SIZE * BOX_SIZE * BOX_SIZE

const boxOpts: IBoxRez = {
  where: new Matrix4().setPosition(0, 0, -5),
  size: BOX_SIZE,
  size2: BOX_SIZE * BOX_SIZE,
  halfsize: (BOX_SIZE / 2) * SIZE,
}

const planeOpts = new PlaneOptions(150, true)
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
  ReadURL('/vox/base_dude.vox')
}

for (let x = 0; x < 100; x++) {
  ReadURL('/vox/tree.vox', treeM$, true)
  ReadURL('/vox/path.vox', treeM$, true)
  ReadURL('/vox/stone.vox', stoneM$, true)
}

export const musicData = {
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
