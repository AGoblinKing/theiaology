import fs from 'file-saver'
import { set } from 'idb-keyval'
import { audio_buffer, audio_name } from 'src/controller/audio'
import { loading } from 'src/controller/controls'
import { timeline_shown } from 'src/fate/editor'
import { Notify } from 'src/notify'
import { first } from 'src/realm'
import { steam } from 'src/steam'
import { dbLoaded, HEADER_START, SIGNATURE } from './load'

export function SaveScript() {
  if (!dbLoaded) return
  const name = first.$.fate.$.text(0)
  Notify(`Keeping ${name}.lisp`, `Another twist in the Weave.`)

  const blob = new Blob([first.$.fate.$.toScript()], {
    type: 'application/lisp',
  })
  fs.saveAs(blob, name + '.lisp')
}

export function Publish(name: string, tags: string[]) {
  loading.set(true)
  Notify(`Publishing ${name} to Steam Workshop`, `This may take a bit!`)
  // save screenshot
  const canvas = document.getElementById('three')

  // @ts-ignore
  canvas.toBlob(
    function (blob) {
      fs.saveAs(blob, `${name}.jpg`)
    },
    'image/jpeg',
    0.75
  )

  Save(true, `${name}`)

  setTimeout(() => {
    // open publish
    steam.$.post(['publish', name, ...tags].join('|'))
  }, 1000)
}

// Save .fate file
export function Save(withFile = true, id?: string) {
  const name = first.$.fate.$.text(0)
  const buff = BuildBuffer()

  if (withFile) {
    Notify(
      `Keeping ${name}.fate`,
      `Drag n' Drop or Load! Share on Workshop and GitHub.`
    )
    fs.saveAs(
      new Blob([buff], {
        type: 'application/octet-stream',
      }),
      `${id === undefined ? name : id}.fate`
    )
  }

  // also save to DB
  set(window.location.pathname, buff)
}

window.addEventListener('keydown', (e) => {
  if (e.key === 's' && e.ctrlKey) {
    Save()
    e.preventDefault()
  }
})

export function BuildBuffer() {
  const { fate: timeline } = first.$
  // [THEA, TIME_SIZE, VOX_SIZE, MUSIC_SIZE, 0, 0, ...
  const header = HEADER_START * 2
  const timelineLength = timeline.$.length * 4
  const audioLength = audio_buffer.$ ? audio_buffer.$.byteLength + 12 : 0

  let voxLength = 0

  Object.entries(first.$.voxes.$).forEach(([key, value]) => {
    // size, string, bytes
    voxLength += 16 + value.view.byteLength
  })

  const buffer = new DataView(
    new ArrayBuffer(audioLength + timelineLength + header + voxLength)
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

  if (audio_buffer.$ !== undefined) {
    // we store in int length
    buffer.setInt32(HEADER_START + 4, audioLength)
    const audioView =
      audio_buffer.$ instanceof DataView
        ? audio_buffer.$
        : new DataView(audio_buffer.$)

    // set audio name
    for (let i = 0; i < Math.min(audio_name.$.length, 12); i++) {
      buffer.setUint8(i + header + timelineLength, audio_name.$.charCodeAt(i))
    }

    for (let i = 0; i < audioView.byteLength; i++) {
      buffer.setUint8(i + header + timelineLength + 12, audioView.getUint8(i))
    }
  } else {
    buffer.setInt32(HEADER_START + 4, 0)
  }

  // VOX files total int size
  const voxStart = header + timelineLength + audioLength
  buffer.setInt32(HEADER_START + 4 + 4, voxLength)

  let cursor = voxStart
  Object.entries(first.$.voxes.$).forEach(([key, value]) => {
    buffer.setInt32(cursor, value.view.byteLength)
    cursor += 4

    for (let i = 0; i < Math.min(12, key.length); i++) {
      const v = key.charCodeAt(i)
      buffer.setUint8(cursor + i, Number.isNaN(v) ? 0 : v)
    }
    cursor += 12

    for (let i = 0; i < value.view.byteLength; i++) {
      buffer.setUint8(cursor + i, value.view.getUint8(i))
    }
    cursor += value.view.byteLength
  })

  return buffer.buffer
}

setInterval(() => {
  if (!timeline_shown.$ || !dbLoaded.$) return
  Save(false)
}, 1000)
