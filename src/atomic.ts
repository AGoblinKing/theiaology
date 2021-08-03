export class Atomic extends Int32Array {
  sab: SharedArrayBuffer
  constructor(sab: SharedArrayBuffer) {
    super(sab)
    this.sab = sab
  }

  store(index: number, value: number): number {
    return Atomics.store(this, index, value)
  }

  load(index: number): number {
    return Atomics.load(this, index)
  }
}
