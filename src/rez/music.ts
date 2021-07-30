import { colors_default } from 'src/magica'
import { meshes } from 'src/rez/rez'
import { Color, Euler, Matrix4, Quaternion, Vector3 } from 'three'

export type Rezer = (
  atom: Matrix4,
  i?: number,
  data?: any,
  cursor?: number
) => Matrix4

const rotQuat = new Quaternion().setFromEuler(new Euler(0.01, -0.01, 0))

const $pos = new Vector3()
const $scale = new Vector3()
const $quat = new Quaternion()

const $color = new Color()
export function MusicRez(
  atom: Matrix4,
  i: number,
  opts: {
    mv: number
    divisor: number
    mv2: number
  },
  cursor
) {
  const col = (i % 255) * 4

  meshes.$.setColorAt(
    cursor,
    $color.setRGB(
      colors_default[col] / 255,
      colors_default[col + 1] / 255,
      colors_default[col + 2] / 255
    )
  )

  return atom
    .decompose($pos, $quat, $scale)
    .compose(
      $pos.set(
        $pos.x + Math.random() * opts.mv - opts.mv2,
        $pos.y + Math.random() * opts.mv - opts.mv2,
        $pos.z + Math.random() * opts.mv - opts.mv2
      ),
      $quat.multiply(rotQuat),
      $scale.set(1, 1, 1)
    )
}
