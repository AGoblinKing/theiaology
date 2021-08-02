export type Atomicable = Uint8Array | Int32Array

export class AtomicBuffer {
  $: Atomicable

  constructor(buffer: Atomicable) {
    this.$ = buffer
  }

  reset(ix: number) {
    Atomics.store(this.$, ix, 0)
  }

  get(ix: number): number {
    return Atomics.load(this.$, ix)
  }

  set(ix: number, value: number) {
    Atomics.store(this.$, ix, value)
  }
}
