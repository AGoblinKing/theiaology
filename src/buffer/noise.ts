import { AtomicByte } from 'src/buffer/atomic'
import { ATOM_COUNT } from 'src/config'

export class Noise extends AtomicByte {
  static COUNT = 5

  constructor(buffer = new SharedArrayBuffer(ATOM_COUNT * Noise.COUNT)) {
    super(buffer)
  }

  instrument(i: number, instrument?: number): number {
    return instrument === undefined
      ? Atomics.load(this, Noise.COUNT * i)
      : Atomics.store(this, Noise.COUNT * i, instrument)
  }

  note(i: number, note?: number): number {
    return note === undefined
      ? Atomics.load(this, Noise.COUNT * i + 1)
      : Atomics.store(this, Noise.COUNT * i + 1, note)
  }

  velocity(i: number, velocity?: number): number {
    return velocity === undefined
      ? Atomics.load(this, Noise.COUNT * i + 2)
      : Atomics.store(this, Noise.COUNT * i + 2, velocity)
  }

  pattern(i: number, pattern?: number): number {
    return pattern === undefined
      ? Atomics.load(this, Noise.COUNT * i + 3)
      : Atomics.store(this, Noise.COUNT * i + 3, pattern)
  }

  interval(i: number, interval?: number): number {
    return interval === undefined
      ? Atomics.load(this, Noise.COUNT * i + 4)
      : Atomics.store(this, Noise.COUNT * i + 4, interval)
  }

  noise(i: number, value?: number): number {
    return this.int32(i, 0, value)
  }
  // bitwise is generally slow on javascript
  int32(i: number, section: number, value?: number): number {
    const start = i * Noise.COUNT
    const offset = section * 4

    if (value !== undefined) {
      // set a bunch of them
      for (let n = 0; n < 4; n++) {
        if (n + offset >= Noise.COUNT) break

        Atomics.store(this, start + n + offset, value & (1 << n))
      }
      return value
    }
    let result = 0
    for (let n = 0; n < 4; n++) {
      if (n + offset >= Noise.COUNT) break

      result += Atomics.load(this, start + n + offset) << (1 << n)
    }
    return result
  }
}
