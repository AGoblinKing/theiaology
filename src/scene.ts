import {
  AmbientLight,
  DirectionalLight,
  Euler,
  Matrix4,
  Quaternion,
} from 'three'
import { ReadURL } from './file'
import { scene } from './render'
import { doStatic, meshes, Rez, SIZE, Sleeper } from './rez'
import { IBoxRez, PlaneOptions, PlaneRez } from './rez/basic'

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

const planeOpts = new PlaneOptions(200, true)
planeOpts.where.setPosition(0, 0, 0)

const PlaneSleep = new Sleeper()

doStatic.on(() => {
  boxOpts.where.multiply(rotMat)
  // Rez(BoxRez, BOX_SIZE3, boxOpts)
  Rez(PlaneRez, planeOpts.size2, planeOpts, PlaneSleep)
})

for (let i = 0; i < 10; i++) {
  ReadURL('./vox/base_dude.vox')
}
