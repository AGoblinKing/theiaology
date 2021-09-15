import { AtomicInt } from 'src/buffer/atomic'
import { ATOM_COUNT } from 'src/config'
import { Vector3 } from 'three'

const $vec3 = new Vector3()

export class SpaceTime extends AtomicInt {
  static COUNT = 4

  constructor(
    shared = new SharedArrayBuffer(ATOM_COUNT * 4 * SpaceTime.COUNT)
  ) {
    super(shared)
  }
  addX(i: number, x: number) {
    return Atomics.add(this, i * SpaceTime.COUNT, x)
  }
  addY(i: number, y: number) {
    return Atomics.add(this, i * SpaceTime.COUNT + 1, y)
  }

  addZ(i: number, z: number) {
    return Atomics.add(this, i * SpaceTime.COUNT + 2, z)
  }

  x(i: number, x?: number) {
    return x === undefined
      ? Atomics.load(this, i * SpaceTime.COUNT)
      : Atomics.store(this, i * SpaceTime.COUNT, x)
  }
  y(i: number, y?: number) {
    return y === undefined
      ? Atomics.load(this, i * SpaceTime.COUNT + 1)
      : Atomics.store(this, i * SpaceTime.COUNT + 1, y)
  }
  z(i: number, z?: number) {
    return z === undefined
      ? Atomics.load(this, i * SpaceTime.COUNT + 2)
      : Atomics.store(this, i * SpaceTime.COUNT + 2, z)
  }
  time(i: number, t?: number) {
    return t === undefined
      ? Atomics.load(this, i * SpaceTime.COUNT + 3)
      : Atomics.store(this, i * SpaceTime.COUNT + 3, t)
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
