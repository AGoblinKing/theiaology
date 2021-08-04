import { AtomicInt } from 'src/atomic'
import { COUNT } from 'src/config'

export class SpaceTime extends AtomicInt {
  static COUNT = 4

  constructor(shared = new SharedArrayBuffer(COUNT * 4 * SpaceTime.COUNT)) {
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
}
