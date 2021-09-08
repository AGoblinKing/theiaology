import { Vector3 } from 'three'

const $vec3 = new Vector3()
export function Plane(i: number, size: number, step: number) {
  return $vec3
    .set((i % size) - size / 2, 0, Math.floor(i / size) - size / 2)
    .multiplyScalar(step * 10)
}

Plane.AtomCount = (size: number, step: number) => {
  return size * size
}

// step is #/ring in this case
export function Ring(i: number, size: number, step: number) {
  const stepper = i * ((2 * Math.PI) / step)
  return $vec3.set(Math.sin(stepper) * size, 0, Math.cos(stepper) * size)
}

// yeah just keeping it consistent
Ring.AtomCount = (size: number, step: number) => {
  return step
}
