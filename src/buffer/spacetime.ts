import { AtomicBuffer } from 'src/atomic'
import { COUNT } from 'src/config'

export class SpaceTime extends AtomicBuffer {
  constructor(buffer = new SharedArrayBuffer(COUNT * 4 * 4)) {
    super(buffer)
  }
  x(i: number, x?: number) {
    return x === undefined ? this.get(i * 4) : this.set(i * 4, x)
  }
  y(i: number, y?: number) {
    return y === undefined ? this.get(i * 4 + 1) : this.set(i * 4 + 1, y)
  }
  z(i: number, z?: number) {
    return z === undefined ? this.get(i * 4 + 2) : this.set(i * 4 + 2, z)
  }
  time(i: number, t?: number) {
    return t === undefined ? this.get(i * 4 + 3) : this.set(i * 4 + 3, t)
  }
}
