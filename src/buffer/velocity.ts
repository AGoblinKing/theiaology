import { AtomicBuffer } from 'src/atomic'
import { COUNT } from 'src/config'

export class Velocity extends AtomicBuffer {
  constructor(buffer = new SharedArrayBuffer(COUNT * 3 * 4)) {
    super(buffer)
  }
  x(i: number, x?: number) {
    return x === undefined ? this.get(i * 3) : this.set(i * 3, x)
  }
  y(i: number, y?: number) {
    return y === undefined ? this.get(i * 3 + 1) : this.set(i * 3 + 1, y)
  }
  z(i: number, z?: number) {
    return z === undefined ? this.get(i * 3 + 2) : this.set(i * 3 + 2, z)
  }
}
