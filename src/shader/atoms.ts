import {
  BoxBufferGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
} from 'three'
import { animation, future, matter, past, size, velocity } from '../buffer'
import { Matter } from '../buffer/matter'
import { SpaceTime } from '../buffer/spacetime'
import { Velocity } from '../buffer/velocity'
import { ENTITY_COUNT, FACES, SIZE } from '../config'
import { scene } from '../render/render'
import { tick } from '../uniform/time'
import { Value } from '../util/value'
import { material } from './material'

// mesh setup
// TODO: Remove instanceMatrix sinces it's not used
export const atoms = new Value(
  new InstancedMesh(
    new BoxBufferGeometry(SIZE, SIZE, SIZE, FACES, FACES, FACES)
      .setAttribute('animation', new InstancedBufferAttribute(animation, 1))
      .setAttribute('past', new InstancedBufferAttribute(past, SpaceTime.COUNT))
      .setAttribute(
        'future',
        new InstancedBufferAttribute(future, SpaceTime.COUNT)
      )
      .setAttribute(
        'matter',
        new InstancedBufferAttribute(matter, Matter.COUNT)
      )
      .setAttribute(
        'velocity',
        new InstancedBufferAttribute(velocity, Velocity.COUNT)
      )
      .setAttribute('size', new InstancedBufferAttribute(size, Velocity.COUNT)),
    material,
    ENTITY_COUNT
  )
)

const $matrix = new Matrix4()
for (let i = 0; i < atoms.$.count; i++) {
  atoms.$.setMatrixAt(i, $matrix.setPosition(0, 0, 0))
}

scene.$.add(atoms.$)

tick.on(($t) => {
  // TODO: Figure out why threejs is not leveraging the sharedarray
  atoms.$.geometry.getAttribute('animation').needsUpdate = true
  atoms.$.geometry.getAttribute('past').needsUpdate = true
  atoms.$.geometry.getAttribute('future').needsUpdate = true
  atoms.$.geometry.getAttribute('matter').needsUpdate = true
  atoms.$.geometry.getAttribute('velocity').needsUpdate = true
  atoms.$.geometry.getAttribute('size').needsUpdate = true
})
