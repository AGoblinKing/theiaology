import { AtomicByte } from 'src/buffer/atomic'

// TODO: Not sure if wanted, but seems likely
export class Input extends AtomicByte {
  // 3 * 10 for the hand vectors
  static COUNT = 8 * 2

  constructor(shared = new SharedArrayBuffer(Input.COUNT)) {
    super(shared)
  }
  pinching(p?: boolean) {
    if (p === undefined) return Atomics.load(this, 0) === 1

    return Atomics.store(this, 0, p ? 1 : 0)
  }
  grabbing(g?: boolean) {
    if (g === undefined) return Atomics.load(this, 1) === 1

    return Atomics.store(this, 1, g ? 1 : 0)
  }
  // defined by the weave
  weave(i: number, w?: boolean) {
    if (w === undefined) return Atomics.load(this, 2 + i) === 1

    return Atomics.store(this, 2 + i, w ? 1 : 0)
  }

  idle() {
    return !(
      this.pinching() &&
      this.grabbing() &&
      this.weave(0) &&
      this.weave(1) &&
      this.weave(2) &&
      this.weave(3) &&
      this.weave(4) &&
      this.weave(5)
    )
  }

  pinchingRight(p?: boolean) {
    if (p === undefined) return Atomics.load(this, 8) === 1

    return Atomics.store(this, 8, p ? 1 : 0)
  }
  grabbingRight(g?: boolean) {
    if (g === undefined) return Atomics.load(this, 1) === 1

    return Atomics.store(this, 9, g ? 1 : 0)
  }
  // defined by the weave
  weaveRight(i: number, w?: boolean) {
    if (w === undefined) return Atomics.load(this, 2 + i) === 1

    return Atomics.store(this, 10 + i, w ? 1 : 0)
  }

  idleRight() {
    return !(
      this.pinchingRight() &&
      this.grabbingRight() &&
      this.weaveRight(0) &&
      this.weaveRight(1) &&
      this.weaveRight(2) &&
      this.weaveRight(3) &&
      this.weaveRight(4) &&
      this.weaveRight(5)
    )
  }
}
