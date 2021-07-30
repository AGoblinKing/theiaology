import {
  BoxBufferGeometry,
  Color,
  InstancedMesh,
  Matrix4,
  Vector3,
} from 'three'
import { material } from '../shader/shader'
import { Value } from '../store'
import { tick } from '../time'

export type Rezer = (
  atom: Matrix4,
  i?: number,
  data?: any,
  cursor?: number
) => Matrix4

export const SIZE = 0.16
export const COUNT = 100000

const SPREAD = 100

const $matrix = new Matrix4()
const $pos = new Vector3()

const $color = new Color()

export class Sleeper {
  $: number
  constructor() {
    this.$ = -1
  }
}
export const meshes = new Value(
  new InstancedMesh(new BoxBufferGeometry(SIZE, SIZE, SIZE), material, COUNT)
)

for (let i = 0; i < meshes.$.count; i++) {
  meshes.$.setMatrixAt(
    i,
    $matrix.setPosition(
      Math.random() * SPREAD - SPREAD / 2,
      (Math.random() * SPREAD) / 2,
      Math.random() * SPREAD - SPREAD / 2
    )
  )
  meshes.$.setColorAt(i, $color.setHex(Math.floor(0xffffff * Math.random())))
}

meshes.$.instanceMatrix.needsUpdate = true

export const doRez = new Value(0)
export const doStatic = new Value(undefined)
export const doLast = new Value(undefined)

export function Rez(rezer: Rezer, count: number, opts?: any, sleep?: Sleeper) {
  if (!sleep || sleep.$ !== doRez.$) {
    for (let i = 0; i < count; i++) {
      const cursor = doRez.$ + i

      if (COUNT <= cursor) {
        doRez.$ += count
        return
      }

      meshes.$.getMatrixAt(cursor, $matrix)
      meshes.$.setMatrixAt(cursor, rezer($matrix, i, opts, cursor))
    }
  }

  if (sleep) sleep.$ = doRez.$

  doRez.$ += count
}

export function Blank(atom: Matrix4) {
  return atom.scale($pos.set(0, 0, 0))
}

tick.on(($t) => {
  // reset rez
  doRez.$ = 0

  // allow statics to run
  doStatic.poke()

  // run the rest of rezes
  doRez.poke()

  // do anything that wants to consume the last bits
  doLast.poke()

  const blankCount = COUNT - doRez.$
  if (blankCount > 0) {
    //Rez(Blank, blankCount)
  }

  meshes.$.instanceMatrix.needsUpdate = true
  meshes.$.instanceColor.needsUpdate = true
})
