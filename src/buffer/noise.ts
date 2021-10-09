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

  // bitwise is generally slow on javascript
  int32(i: number, section: number, value?: number): number {
    const start = i * Noise.COUNT
    const offset = section * 4

    if (value !== undefined) {
      // set a bunch of them
      for (let x = 0; x < 4; x++) {
        if (x + offset >= Noise.COUNT) break

        Atomics.store(this, start + x + offset, value & (x * 8))
      }
      return value
    }
    let result = 0
    for (let x = 0; x < 4; x++) {
      if (x + offset >= Noise.COUNT) break

      result += Atomics.load(this, start + x + offset) << (x * 8)
    }
    return result
  }
}