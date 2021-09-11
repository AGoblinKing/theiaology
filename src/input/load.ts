import { Fate } from 'src/realm/fate'
import type { Realm } from 'src/realm/realm'
import { MagickaVoxel } from 'src/render/magica'
import { Value } from 'src/value'

// Load .theia file into the timePline
export const SIGNATURE = 'THEA'
export const HEADER_START = 4 * 4

export const HEADER_END = HEADER_START + 4 * 4

// map json ID to timeline ID

export function Load(bytes: ArrayBuffer, realm: Realm) {
  const { timeline, timelineJSON } = realm

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
      timeline.$[i] = val

      // remove indexes from available as you come across them
      if (i % Fate.COUNT === 1 && val !== 0) {
        timeline.$.available.splice(
          timeline.$.available.indexOf(Math.floor(i / Fate.COUNT)),
          1
        )
      }
    }

    // Music
    const musicLength = view.getInt32(HEADER_START + 4)
    const musicEnd = HEADER_END + musicLength + timeLength

    // skip music if they're not the current reality
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

      for (let i = 0; i < (musicLength - 12) / 4 - 1; i++) {
        music.setInt32(i * 4, view.getInt32(timeEnd + i * 4 + 12))
      }

      realm.musicBuffer = new DataView(mab)
      realm.musicName = str
      realm.musicString = URL.createObjectURL(new File([mab], 'thea'))
    }

    // clear existing vox

    // Vox
    const voxLength = view.getInt32(HEADER_START + 4 + 4)
    const voxUpdate = {}
    if (voxLength > 0) {
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
          const c = view.getUint8(musicEnd + cursor + i)
          if (c === 0) continue

          str += String.fromCharCode(c)
        }
        cursor += 12

        // Slice so you can share the data to the worker
        voxUpdate[str] = new MagickaVoxel(
          new DataView(bytes.slice(cursor + musicEnd, cursor + musicEnd + size))
        )

        cursor += size
        size = 0
      }
    }
    realm.voxes.set(voxUpdate)
    // only poke at the end incase we need to revert
    timeline.poke()
    timelineJSON.set(timeline.$.toObject())
  } catch (ex) {
    // undo that garbo
    timeline.$.freeAll()
    timeline.poke()
    throw ex
  }
}

export const dbLoaded = new Value(false)
