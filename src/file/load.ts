import { audio, audio_buffer } from 'src/audio'
import { timeline } from 'src/buffer'
import { Timeline } from 'src/buffer/timeline'

// Load .theia file into the timeline
export const SIGNATURE = 'THEA'
export const HEADER_START = 4 * 4

export const HEADER_END = HEADER_START + 4 * 4

export function Load(bytes: ArrayBuffer) {
  try {
    const view = new DataView(bytes)

    // check for THEA file type
    for (let i = 0; i < SIGNATURE.length; i++) {
      if (view.getUint8(i) !== SIGNATURE.charCodeAt(i)) {
        throw new Error('Not a valid THEIA file')
      }
    }

    // Timeline
    const timeLength = view.getInt32(HEADER_START)
    const timeEnd = HEADER_END + timeLength

    timeline.$.freeAll()
    for (let i = 0; i < timeLength / 4; i++) {
      const val = view.getInt32(HEADER_END + i * 4)
      timeline.$.store(i, val)

      // remove indexes from available as you come across them
      if (i % Timeline.COUNT === 1 && val !== 0) {
        timeline.$.available.splice(
          timeline.$.available.indexOf(Math.floor(i / Timeline.COUNT)),
          1
        )
      }
    }

    // Music
    const musicLength = view.getInt32(HEADER_START + 4)

    if (musicLength > 0) {
      const mab = new ArrayBuffer(musicLength)
      const music = new DataView(mab)
      for (let i = 0; i < musicLength / 4 - 1; i++) {
        music.setInt32(i * 4, view.getInt32(timeEnd + i * 4))
      }
      audio_buffer.set(music)
      audio.src = URL.createObjectURL(new File([mab], 'thea'))
      audio.load()
    }

    // only poke at the end incase we need to revert
    timeline.poke()
  } catch (ex) {
    // undo that garbo
    console.log(ex)
    timeline.$.freeAll()
  }
}
