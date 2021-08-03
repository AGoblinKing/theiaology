import {
  BoxBufferGeometry,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Vector3,
} from 'three'
import { animation, future, matter, past, velocity } from './buffer'
import { COUNT } from './config'
import { scene } from './render'
import { material } from './shader/material'
import {
  doLast as closeTime,
  doRez as rezTime,
  doStatic as openTime,
  tick,
} from './time'
import { Value } from './valuechannel'

export type Rezer = (
  atom: Matrix4,
  i?: number,
  data?: any,
  cursor?: number
) => Matrix4

export const SIZE = 0.16
export const SPREAD = 75
export const FACES = 1

const $matrix = new Matrix4()
const $pos = new Vector3()
const $color = new Color()

// Sleeper allows Rezes to skip updates based on their past index
export class Sleeper {
  $: number
  constructor() {
    this.$ = -1
  }
}

// mesh setup
export const atoms = new Value(
  new InstancedMesh(
    new BoxBufferGeometry(SIZE, SIZE, SIZE, FACES, FACES, FACES)
      .setAttribute('animation', new InstancedBufferAttribute(animation, 1))
      .setAttribute('past', new InstancedBufferAttribute(past, 4))
      .setAttribute('future', new InstancedBufferAttribute(future, 4))
      .setAttribute('matter', new InstancedBufferAttribute(matter, 4))
      .setAttribute('velocity', new InstancedBufferAttribute(velocity, 3)),
    material,
    COUNT
  )
)

scene.$.add(atoms.$)

for (let i = 0; i < atoms.$.count; i++) {
  atoms.$.setMatrixAt(
    i,
    $matrix.setPosition(
      Math.random() * SPREAD - SPREAD / 2,
      (Math.random() * SPREAD) / 2,
      Math.random() * SPREAD - SPREAD / 2
    )
  )
  atoms.$.setColorAt(i, $color.setHex(Math.floor(0xffffff * Math.random())))
}

export function Rez(rezer: Rezer, count: number, opts?: any, sleep?: Sleeper) {
  if (!sleep || sleep.$ !== rezTime.$) {
    for (let i = 0; i < count; i++) {
      const cursor = rezTime.$ + i

      if (COUNT <= cursor) {
        rezTime.$ += count
        return
      }

      atoms.$.getMatrixAt(cursor, $matrix)
      atoms.$.setMatrixAt(cursor, rezer($matrix, i, opts, cursor))
    }
  }

  if (sleep) sleep.$ = rezTime.$

  rezTime.$ += count
}

export function Blank(atom: Matrix4) {
  return atom.scale($pos.set(0, 0, 0))
}

tick.on(($t) => {
  // reset rez
  rezTime.$ = 0

  // allow statics to run
  openTime.poke()

  // run the rest of rezes
  rezTime.poke()

  // do anything that wants to consume the last bits
  closeTime.poke()

  const blankCount = COUNT - rezTime.$
  if (blankCount > 0) {
    //Rez(Blank, blankCount)
  }

  atoms.$.instanceMatrix.needsUpdate = true
  // TODO: Move over to material
  atoms.$.instanceColor.needsUpdate = true

  // TODO: Figure out why threejs is not leveraging the sharedarray
  atoms.$.geometry.getAttribute('animation').needsUpdate = true
  atoms.$.geometry.getAttribute('past').needsUpdate = true
  atoms.$.geometry.getAttribute('future').needsUpdate = true
  atoms.$.geometry.getAttribute('matter').needsUpdate = true
  atoms.$.geometry.getAttribute('velocity').needsUpdate = true
})
