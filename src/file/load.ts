import { get } from 'idb-keyval'
import { audio, audio_buffer, audio_name } from 'src/audio'
import { timeline } from 'src/buffer'
import { Timeline } from 'src/buffer/timeline'
import { MagickaVoxel } from 'src/magica'
import { Value } from 'src/value'
import { voxes } from 'src/vox'

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
    const musicEnd = HEADER_END + musicLength + timeLength

    if (musicLength > 0) {
      // 16 for string name
      const mab = new ArrayBuffer(musicLength - 12)
      const music = new DataView(mab)

      let str = ''
      for (let i = 0; i < 12; i++) {
        const v = view.getUint8(timeEnd + i)
        if (v === 0) break
        str += String.fromCharCode(v)
      }

      audio_name.set(str)

      for (let i = 0; i < (musicLength - 12) / 4 - 1; i++) {
        music.setInt32(i * 4, view.getInt32(timeEnd + i * 4 + 12))
      }
      audio_buffer.set(music)
      audio.src = URL.createObjectURL(new File([mab], 'thea'))
      audio.load()
    }

    // Vox
    const voxLength = view.getInt32(HEADER_START + 4 + 4)

    if (voxLength > 0) {
      const voxUpdate = {}
      //size[ 12 char string name, vox raw data]size[]
      // rip through and read these

      let cursor = 0
      let size = 0

      while (cursor < voxLength) {
        if (size === 0) {
          size = view.getInt32(musicEnd + cursor)
          cursor += 4
        }
        let str = ''
        // decode string here
        for (let i = 0; i < 12; i++) {
          str += String.fromCharCode(view.getUint8(musicEnd + cursor + i))
        }
        cursor += 12

        // create dataview into this now
        voxUpdate[str] = new MagickaVoxel(
          new DataView(bytes, cursor + musicEnd, size)
        )
        cursor += size
      }

      voxes.set(voxUpdate)
    }

    // only poke at the end incase we need to revert
    timeline.poke()
  } catch (ex) {
    // undo that garbo
    console.log(ex)
    timeline.$.freeAll()
    timeline.poke()
  }
}

export const dbLoaded = new Value(false)
get(window.location.pathname).then((v) => {
  dbLoaded.set(true)
  if (v) {
    Load(v)
  }
})
