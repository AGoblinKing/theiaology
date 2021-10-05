import { Box3 } from 'three'
import { Vec3 } from './vec3'

export class BBox extends Box3 {
  i: number
  constructor(i: number) {
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

export class Size extends Vec3 {
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
}
