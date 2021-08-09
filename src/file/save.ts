import fs from 'file-saver'
import { audio_buffer } from 'src/audio'
import { timeline } from 'src/buffer'
import { HEADER_START, Load, SIGNATURE } from './load'

// Save .theia file
export function Save() {
  const name = timeline.$.text(0)
  const buff = BuildBuffer()

  fs.saveAs(
    new Blob([buff], {
      type: 'application/octet-stream',
    }),
    `${name}.theia`
  )

  setTimeout(() => Load(buff), 1000)
}

export function BuildBuffer() {
  // [THEA, TIME_SIZE, VOX_SIZE, MUSIC_SIZE, 0, 0, ...
  const header = HEADER_START * 2
  const timelineLength = timeline.$.length * 4
  const audioLength = audio_buffer.$ ? audio_buffer.$.byteLength : 0

  const buffer = new DataView(
    new ArrayBuffer(audioLength + timelineLength + header)
  )

  SIGNATURE.split('').forEach((s, i) => {
    buffer.setUint8(i, s.charCodeAt(0))
  })

  // API version
  buffer.setInt32(HEADER_START + 4 * 3, 0)

  // Theiaology
  buffer.setInt32(HEADER_START, timeline.$.length * 4)

  for (let i = 0; i < timeline.$.length - 1; i++) {
    buffer.setInt32(i * 4 + header, timeline.$.load(i))
  }

  // Music
  if (audio_buffer.$) {
    // we store in int length
    buffer.setInt32(HEADER_START + 4, audio_buffer.$.byteLength)
    const audioView =
      audio_buffer.$ instanceof DataView
        ? audio_buffer.$
        : new DataView(audio_buffer.$)
    for (let i = 0; i < audioView.byteLength; i++) {
      buffer.setUint8(i + header + timelineLength, audioView.getUint8(i))
    }
  } else {
    buffer.setInt32(HEADER_START + 4, 0)
  }

  // VOX files total int size
  buffer.setInt32(HEADER_START + 4 * 2, 0)

  return buffer.buffer
}
