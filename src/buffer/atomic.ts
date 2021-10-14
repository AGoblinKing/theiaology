export interface IAtomic {
  sab: SharedArrayBuffer

  store(index: number, value: number): number
  load(index: number): number
  free(index: number)
}

const strConvertBuffer = new ArrayBuffer(4) // an Int32 takes 4 bytes
const strView = new DataView(strConvertBuffer)
function CharCode(code: number) {
  switch (code) {
    case 0:
      return ''
    default:
      return String.fromCharCode(code)
  }
}

export function StringToInt(str: string) {
  // max 4 chars
  str = str.slice(0, 4)

  for (let si = 0; si < 4; si++) {
    if (si < str.length) {
      strView.setUint8(si, str.charCodeAt(si))
    } else {
      strView.setUint8(si, 0)
    }
  }

  return strView.getInt32(0)
}

export function IntToString(num: number) {
  strView.setInt32(0, num, false)
  return (
    CharCode(strView.getUint8(0)) +
    CharCode(strView.getUint8(1)) +
    CharCode(strView.getUint8(2)) +
    CharCode(strView.getUint8(3))
  )
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
