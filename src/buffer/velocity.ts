import { AtomicInt } from 'src/buffer/atomic'
import { ENTITY_COUNT } from 'src/config'
import { Vector3 } from 'three'

const $vec3 = new Vector3()

export class Velocity extends AtomicInt {
  static COUNT = 3

  constructor(
    buffer = new SharedArrayBuffer(ENTITY_COUNT * Velocity.COUNT * 4)
  ) {
    super(buffer)
  }
  addX(i: number, x: number) {
    return Atomics.add(this, i * Velocity.COUNT, x)
  }
  addY(i: number, y: number) {
    return Atomics.add(this, i * Velocity.COUNT + 1, y)
  }

  addZ(i: number, z: number) {
    return Atomics.add(this, i * Velocity.COUNT + 2, z)
  }
  x(i: number, x?: number) {
    return x === undefined
      ? Atomics.load(this, i * Velocity.COUNT)
      : Atomics.store(this, i * Velocity.COUNT, x)
  }

  y(i: number, y?: number) {
    return y === undefined
      ? Atomics.load(this, i * Velocity.COUNT + 1)
      : Atomics.store(this, i * Velocity.COUNT + 1, y)
  }

  z(i: number, z?: number) {
    return z === undefined
      ? Atomics.load(this, i * Velocity.COUNT + 2)
      : Atomics.store(this, i * Velocity.COUNT + 2, z)
  }
  vec3(i: number, vec3 = $vec3) {
    return vec3.set(this.x(i), this.y(i), this.z(i))
  }
  setVec3(i: number, vec3: Vector3) {
    this.x(i, Math.round(vec3.x))
    this.y(i, Math.round(vec3.y))
    this.z(i, Math.round(vec3.z))
    return vec3
  }
}
