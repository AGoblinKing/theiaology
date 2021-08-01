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

/*   // position
    Atomics.load(sharedTypedArray, ix + 0),
    Atomics.load(sharedTypedArray, ix + 1),
    Atomics.load(sharedTypedArray, ix + 2),

    // last position
    Atomics.load(sharedTypedArray, ix + 3),
    Atomics.load(sharedTypedArray, ix + 4),
    Atomics.load(sharedTypedArray, ix + 5),

    // animation 1
    Atomics.load(sharedTypedArray, ix + 6),
    Atomics.load(sharedTypedArray, ix + 7),
    Atomics.load(sharedTypedArray, ix + 8),

    // animation 2
    Atomics.load(sharedTypedArray, ix + 9),
    Atomics.load(sharedTypedArray, ix + 10),
    Atomics.load(sharedTypedArray, ix + 11),

    // color
    Atomics.load(sharedTypedArray, ix + 12),

    // scale
    Atomics.load(sharedTypedArray, ix + 13),

    // last scale
    Atomics.load(sharedTypedArray, ix + 14),

    // timestamp to complete lerps by
    Atomics.load(sharedTypedArray, ix + 15)*/
