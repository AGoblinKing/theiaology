import { ATOM_COUNT } from 'src/config'
import { Box3, Vector3 } from 'three'
import { AtomicInt } from './atomic'
import { Vec3 } from './vec3'

export class BBox extends Box3 {
  i: number
  constructor(i: number = 0) {
    super()
    this.i = i
  }

  get minX() {
    return this.min.x
  }
  get minY() {
    return this.min.y
  }
  get minZ() {
    return this.min.z
  }
  get maxX() {
    return this.max.x
  }
  get maxY() {
    return this.max.y
  }
  get maxZ() {
    return this.max.z
  }
}

const $box = new BBox(0)
const $vec3 = new Vector3()

export class Size extends AtomicInt {
  static COUNT = 4

  box(i: number, future: Vec3, $bb: BBox = $box) {
    const sx = this.x(i) / 2,
      sy = this.y(i) / 2,
      sz = this.z(i) / 2,
      x = future.x(i),
      y = future.y(i),
      z = future.z(i)

    $bb.min.set(x - sx, y - sy, z - sz), $bb.max.set(x + sx, y + sy, z + sz)

    $bb.i = i
    return $bb
  }

  constructor(buffer = new SharedArrayBuffer(ATOM_COUNT * Size.COUNT * 4)) {
    super(buffer)
  }
  addX(i: number, x: number) {
    return Atomics.add(this, i * Size.COUNT, x)
  }
  addY(i: number, y: number) {
    return Atomics.add(this, i * Size.COUNT + 1, y)
  }

  addZ(i: number, z: number) {
    return Atomics.add(this, i * Size.COUNT + 2, z)
  }
  x(i: number, x?: number) {
    return x === undefined
      ? Atomics.load(this, i * Size.COUNT)
      : Atomics.store(this, i * Size.COUNT, x)
  }

  y(i: number, y?: number) {
    return y === undefined
      ? Atomics.load(this, i * Size.COUNT + 1)
      : Atomics.store(this, i * Size.COUNT + 1, y)
  }

  z(i: number, z?: number) {
    return z === undefined
      ? Atomics.load(this, i * Size.COUNT + 2)
      : Atomics.store(this, i * Size.COUNT + 2, z)
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

  pattern(i: number, glyph?: number) {
    return glyph === undefined
      ? Atomics.load(this, i * Size.COUNT + 3)
      : Atomics.store(this, i * Size.COUNT + 3, glyph)
  }
}
