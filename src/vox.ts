import { Color, Matrix4, Vector3 } from 'three'
import { MagickaVoxel } from './magica'
import { doRez, doStatic, meshes, Rez, SIZE, Sleeper } from './rez'

export const voxels: Voxel[] = []
export const voxels_static: Voxel[] = []

export class Voxel {
  where: Matrix4
  what: MagickaVoxel

  constructor(where: Matrix4, what: MagickaVoxel) {
    this.where = where
    this.what = what
  }
}

const $color = new Color()
const $vec3 = new Vector3()

function VoxelRez(atom: Matrix4, i: number, opt: Voxel, cursor): Matrix4 {
  const v = opt.what.xyzi
  const col = opt.what.rgba
  const c = i * 4
  const colIdx = (v[c + 3] - 1) * 4

  meshes.$.setColorAt(
    cursor,
    $color.setRGB(
      (col[colIdx] / 255) * (0.9 + Math.random() * 0.1),
      (col[colIdx + 1] / 255) * (0.9 + Math.random() * 0.1),
      (col[colIdx + 2] / 255) * (0.9 + Math.random() * 0.1)
    )
  )

  return atom
    .identity()
    .setPosition(
      $vec3
        .set(v[c] * SIZE, v[c + 2] * SIZE, v[c + 1] * SIZE)
        .applyMatrix4(opt.where)
        .multiplyScalar(Math.random() * 0.0005 + 0.995)
    )
    .multiply(opt.where)
}

doRez.on(() => {
  for (let i = 0; i < voxels.length; i++) {
    Rez(VoxelRez, voxels[i].what.length(), voxels[i])
  }
})

const sleepers = []
doStatic.on(() => {
  for (let i = 0; i < voxels_static.length; i++) {
    if (!sleepers[i]) {
      sleepers[i] = new Sleeper()
    }
    Rez(VoxelRez, voxels_static[i].what.length(), voxels_static[i], sleepers[i])
  }
})
