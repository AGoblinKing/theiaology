import fs from 'file-saver'
import { timeline } from 'src/buffer'
import { Load, TIME_START } from './load'

// Save .theia file
export function Save() {
  const name = window.location.pathname || 'root'
  const buff = BuildFlatBuffer()

  fs.saveAs(
    new Blob([buff], {
      type: 'application/octet-stream',
    }),
    `${name}.theia`
  )

  setTimeout(() => Load(buff), 1000)
}

export function BuildFlatBuffer() {
  // [THEA, TIME_SIZE, VOX_SIZE, MUSIC_SIZE, 0, 0, ...
  const buffer = new DataView(
    new ArrayBuffer(timeline.$.length * 4 + TIME_START * 2)
  )

  'THEA'.split('').forEach((s) => {
    buffer.setUint8(0, s.charCodeAt(0))
  })

  buffer.setInt32(TIME_START, timeline.$.length)

  for (let i = 0; i < timeline.$.length - 1; i++) {
    buffer.setInt32(i * 4 + TIME_START * 2, timeline.$.load(i))
  }

  return buffer.buffer
}
