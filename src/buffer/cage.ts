import { ENTITY_COUNT } from 'src/config'
import { Box3 } from 'three'
import { AtomicInt } from './atomic'

export class Cage extends AtomicInt {
  static COUNT = 6

  constructor(buffer = new SharedArrayBuffer(ENTITY_COUNT * Cage.COUNT * 4)) {
    super(buffer)
  }
  addX(i: number, x: number) {
    return Atomics.add(this, i * Cage.COUNT, x)
  }
  addY(i: number, y: number) {
    return Atomics.add(this, i * Cage.COUNT + 1, y)
  }

  addZ(i: number, z: number) {
    return Atomics.add(this, i * Cage.COUNT + 2, z)
  }

  addMX(i: number, x: number) {
    return Atomics.add(this, i * Cage.COUNT + 3, x)
  }

  addMY(i: number, y: number) {
    return Atomics.add(this, i * Cage.COUNT + 4, y)
  }

  addMZ(i: number, z: number) {
    return Atomics.add(this, i * Cage.COUNT + 5, z)
  }

  x(i: number, x?: number) {
    return x === undefined
      ? Atomics.load(this, i * Cage.COUNT)
      : Atomics.store(this, i * Cage.COUNT, x)
  }

  y(i: number, y?: number) {
    return y === undefined
      ? Atomics.load(this, i * Cage.COUNT + 1)
      : Atomics.store(this, i * Cage.COUNT + 1, y)
  }

  z(i: number, z?: number) {
    return z === undefined
      ? Atomics.load(this, i * Cage.COUNT + 2)
      : Atomics.store(this, i * Cage.COUNT + 2, z)
  }

  mX(i: number, x?: number) {
    return x === undefined
      ? Atomics.load(this, i * Cage.COUNT + 3)
      : Atomics.store(this, i * Cage.COUNT + 3, x)
  }

  mY(i: number, y?: number) {
    return y === undefined
      ? Atomics.load(this, i * Cage.COUNT + 4)
      : Atomics.store(this, i * Cage.COUNT + 4, y)
  }

  mZ(i: number, z?: number) {
    return z === undefined
      ? Atomics.load(this, i * Cage.COUNT + 5)
      : Atomics.store(this, i * Cage.COUNT + 5, z)
  }

  box(i, box: Box3) {
    this.x(i, box.min.x)
    this.y(i, box.min.y)
    this.z(i, box.min.z)
    this.mX(i, box.max.x)
    this.mY(i, box.max.y)
    this.mZ(i, box.max.z)
  }
}
