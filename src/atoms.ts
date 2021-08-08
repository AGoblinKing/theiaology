import {
  BoxBufferGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
} from 'three'
import { animation, future, matter, past, velocity } from './buffer'
import { ENTITY_COUNT } from './config'
import { scene } from './render'
import { material } from './shader/material'
import { tick } from './time'
import { Value } from './value'

export const SIZE = 0.16
export const FACES = 1

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
    ENTITY_COUNT
  )
)

scene.$.add(atoms.$)

tick.on(($t) => {
  // atoms.$.instanceMatrix.needsUpdate = true
  // // TODO: Move over to material
  // atoms.$.instanceColor.needsUpdate = true

  // TODO: Figure out why threejs is not leveraging the sharedarray
  atoms.$.geometry.getAttribute('animation').needsUpdate = true
  atoms.$.geometry.getAttribute('past').needsUpdate = true
  atoms.$.geometry.getAttribute('future').needsUpdate = true
  atoms.$.geometry.getAttribute('matter').needsUpdate = true
  atoms.$.geometry.getAttribute('velocity').needsUpdate = true
})
