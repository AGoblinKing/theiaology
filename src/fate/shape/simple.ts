import { Vector3 } from 'three'
import { EAxis } from '../weave'

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

// draw outline of rectangle based on x and y
export function Rectangle(
  i: number,
  width: number,
  step: number,
  height: number
) {
  const d = width * height * step
  const c = Rectangle.AtomCount(width, step, height)
  const h = c / 2

  const w2 = width * 2

  let x = i < w2 ? i % width : i - w2 > height ? width : 0
  let y = i > w2 ? (i - w2) % height : i < width ? height : 0

  // set a rectangel
  return $vec3.set(x - width / 2, 0, y - height / 2).multiplyScalar(step * 10)
}

Rectangle.AtomCount = (x: number, step: number, z: number) => {
  return x * 2 + z * 2
}

export function Line(i: number, count: number, margin: number, axis: EAxis) {
  switch (axis) {
    case EAxis.X:
      return $vec3.set(i * margin, 0, 0)
    case EAxis.Y:
      return $vec3.set(0, i * margin, 0)
    case EAxis.Z:
      return $vec3.set(0, 0, i * margin)
    case EAxis.XY:
      return $vec3.set(i * margin, i * margin, 0)
    case EAxis.XZ:
      return $vec3.set(i * margin, 0, i * margin)
    case EAxis.YZ:
      return $vec3.set(0, i * margin, i * margin)
    case EAxis.XYZ:
      return $vec3.set(i * margin, i * margin, i * margin)
  }
}

Line.AtomCount = (count: number, margin: number, axis: EAxis) => {
  return count
}
