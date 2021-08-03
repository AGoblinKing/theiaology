export class IntShared extends Int32Array {
  sab: SharedArrayBuffer
  constructor(sab: SharedArrayBuffer) {
    super(sab)
    this.sab = sab
  }
}
