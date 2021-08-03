import { matter, velocity } from 'src/buffer'
import { EPhase } from 'src/buffer/matter'
import { colors_default } from 'src/magica'
import { atoms } from 'src/rez'
import { delta } from 'src/time'
import { Color, Euler, Matrix4, Quaternion, Vector3 } from 'three'

export type Rezer = (
  atom: Matrix4,
  i?: number,
  data?: any,
  cursor?: number
) => Matrix4

const rotQuat = new Quaternion().setFromEuler(new Euler(1, -1, 0))

const $pos = new Vector3()
const $scale = new Vector3()
const $quat = new Quaternion()
const $quat2 = new Quaternion()

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

  // accel
  velocity.y(cursor, velocity.y(i) - 1)

  atoms.$.setColorAt(
    cursor,
    $color.setRGB(
      colors_default[col] / 255,
      colors_default[col + 1] / 255,
      colors_default[col + 2] / 255
    )
  )

  matter.phase(cursor, EPhase.SOLID)

  return atom
    .decompose($pos, $quat, $scale)
    .compose(
      $pos.set(
        $pos.x + Math.random() * opts.mv - opts.mv2,
        $pos.y + Math.random() * opts.mv - opts.mv2,
        $pos.z + Math.random() * opts.mv - opts.mv2
      ),
      $quat.slerp($quat2.copy($quat).multiply(rotQuat), delta.$ * 0.001),
      $scale.set(1, 1, 1)
    )
}
