import { doRez, doStatic } from 'src/time'
import { Color, Matrix4, Vector3 } from 'three'
import { MagickaVoxel } from '../magica'
import { atoms, Rez, SIZE, Sleeper } from '../rez'

export const voxels: Voxel[] = []
export const voxels_static: Voxel[] = []

export class Voxel {
  where: Matrix4
  what: MagickaVoxel
  shift: number

  constructor(where: Matrix4, what: MagickaVoxel, shift: number = 0) {
    this.where = where
    this.what = what
    this.shift = shift
  }
}

const $color = new Color()
const $vec3 = new Vector3()
const $hsl = { h: 0, s: 0, l: 0 }

function VoxelShape(atom: Matrix4, i: number, v: Voxel, ix): Matrix4 {
  const vec = v.what.xyzi
  const col = v.what.rgba
  const c = i * 4
  const colIdx = (vec[c + 3] - 1) * 4

  $color
    .setRGB(col[colIdx] / 255, col[colIdx + 1] / 255, col[colIdx + 2] / 255)
    .getHSL($hsl)

  $hsl.h += v.shift

  $color.setHSL($hsl.h, $hsl.s, $hsl.l)

  atoms.$.setColorAt(ix, $color)

  return atom
    .identity()
    .setPosition(
      $vec3
        .set(vec[c] * SIZE, vec[c + 2] * SIZE, vec[c + 1] * SIZE)
        .applyMatrix4(v.where)
        .multiplyScalar(Math.random() * 0.0005 + 0.995)
    )
    .multiply(v.where)
}

doRez.on(() => {
  for (let i = 0; i < voxels.length; i++) {
    Rez(VoxelShape, voxels[i].what.length(), voxels[i])
  }
})

const sleepers = []
doStatic.on(() => {
  for (let i = 0; i < voxels_static.length; i++) {
    if (!sleepers[i]) {
      sleepers[i] = new Sleeper()
    }
    Rez(
      VoxelShape,
      voxels_static[i].what.length(),
      voxels_static[i],
      sleepers[i]
    )
  }
})
