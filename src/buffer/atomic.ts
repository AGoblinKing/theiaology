export interface IAtomic {
  sab: SharedArrayBuffer

  store(index: number, value: number): number
  load(index: number): number
  free(index: number)
}

export class AtomicInt extends Int32Array implements IAtomic {
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

  free(index: number, size: number = 1) {
    for (let i = 0; i < size; i++) {
      Atomics.store(this, index * size + i, 0)
    }
  }
}

export class AtomicByte extends Uint8Array implements IAtomic {
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

  free(index: number, size: number = 1) {
    for (let i = 0; i < size; i++) {
      Atomics.store(this, index * size + i, 0)
    }
  }
}
