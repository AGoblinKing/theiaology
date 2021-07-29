import {
  BoxBufferGeometry,
  Color,
  Euler,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three'
import { upperAvg } from './audio'
import { mouse_left, mouse_right } from './input'
import { material } from './shader'
import { Value } from './store'
import { delta, tick } from './time'

export type Rezer = (
  atom: Matrix4,
  i?: number,
  data?: any,
  cursor?: number
) => Matrix4

export const SIZE = 0.16

const SPREAD = 100
const MOVE = 10
export const COUNT = 50000
const rotQuat = new Quaternion().setFromEuler(new Euler(0.01, -0.01, 0))

export const $matrix = new Matrix4()
export const $pos = new Vector3()
export const $scale = new Vector3()
export const $quat = new Quaternion()

const $color = new Color()

export const meshes = new Value(
  new InstancedMesh(new BoxBufferGeometry(SIZE, SIZE, SIZE), material, COUNT)
)

for (let i = 0; i < meshes.$.count; i++) {
  meshes.$.setMatrixAt(
    i,
    $matrix.setPosition(
      Math.random() * SPREAD - SPREAD / 2,
      Math.random() * SPREAD - SPREAD / 2,
      Math.random() * SPREAD - SPREAD / 2
    )
  )
  meshes.$.setColorAt(i, $color.setHex(Math.floor(0xffffff * Math.random())))
}

meshes.$.instanceMatrix.needsUpdate = true

export const doRez = new Value(0)

interface MusicData {
  mv: number
  divisor: number
  mv2: number
}

const musicData: MusicData = {
  mv: 0,
  mv2: 0,
  divisor: 0,
}

export function Rez(rezer: Rezer, count: number, opts?: any) {
  for (let i = 0; i < count; i++) {
    const cursor = doRez.$ + i
    meshes.$.getMatrixAt(cursor, $matrix)
    meshes.$.setMatrixAt(cursor, rezer($matrix, i, opts, cursor))
  }

  doRez.$ += count
}

export function Blank(atom: Matrix4) {
  return atom.scale($pos.set(0, 0, 0))
}

export function Music(atom: Matrix4, i: number, opts: MusicData) {
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

tick.on(($t) => {
  doRez.is(0)

  const blankCount = meshes.$.count - doRez.$

  if (blankCount > 0) {
    musicData.mv = MOVE * delta.$ * upperAvg.$
    musicData.mv2 = musicData.mv / 2
    musicData.divisor = mouse_left.$ ? 0.99 : mouse_right.$ ? 1.01 : 0.9999

    Rez(Music, blankCount, musicData)
  }

  meshes.$.instanceMatrix.needsUpdate = true
  meshes.$.instanceColor.needsUpdate = true
})
