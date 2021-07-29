// parse magica voxel files

const INT_SIZE = 4

export class MagickaVoxel {
  view: DataView
  xyzi: Uint8Array
  rgba: Uint8Array

  constructor(data: ArrayBufferLike) {
    this.view = new DataView(data)

    this.chunk()
  }

  version() {
    return this.view.getInt32(4, true)
  }

  data(id: string, start: number) {
    let cursor = start

    switch (id) {
      case 'RGBA':
        this.rgba = new Uint8Array(this.view.buffer, cursor, 256 * 4)

        break
      case 'XYZI':
        const count = this.view.getInt32(cursor, true)
        cursor += INT_SIZE

        this.xyzi = new Uint8Array(this.view.buffer, cursor, count * 4)

        break
    }
  }

  length() {
    return this.xyzi.length / 4
  }
  chunk(start: number = 8) {
    let cursor = start
    const id = this.readID(cursor)
    cursor += INT_SIZE

    const chunkBytes = this.view.getInt32(cursor, true)
    cursor += INT_SIZE

    const childBytes = this.view.getInt32(cursor, true)
    cursor += INT_SIZE

    const end = cursor + chunkBytes + childBytes

    // nothing here
    if (chunkBytes + childBytes === 0) return

    if (chunkBytes > 0 && id) {
      this.data(id, cursor)
    }

    if (childBytes > 0) {
      return this.chunk(cursor + chunkBytes)
    }

    // siblings
    if (end !== this.view.byteLength) {
      this.chunk(end)
    }
  }

  readID(idx: number): string {
    let id = ''
    for (let i = idx; i < idx + 4; i++) {
      id += String.fromCharCode(this.view.getUint8(i))
    }
    return id
  }
}
