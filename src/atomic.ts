export type Atomicable = Uint8Array | Int32Array

export class AtomicBuffer {
  $: Atomicable
  shared: SharedArrayBuffer

  constructor(buffer: SharedArrayBuffer) {
    this.shared = buffer
    this.$ = new Int32Array(buffer)
  }

  reset(ix: number) {
    Atomics.store(this.$, ix, 0)
  }

  get(ix: number): number {
    return Atomics.load(this.$, ix)
  }

  set(ix: number, value: number) {
    return Atomics.store(this.$, ix, value)
  }
}
