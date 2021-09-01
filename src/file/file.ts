import { get } from 'idb-keyval'
import { rootTheia } from 'src/config'
import { url } from 'src/input/browser'
import { first } from 'src/land/land'
import { MagickaVoxel } from 'src/render/magica'
import { audio, audio_buffer, audio_name } from 'src/sound/audio'
import { INode } from 'src/timeline/def-timeline'
import { dbLoaded, Load } from './load'

window.addEventListener('dragover', (e) => {
  e.dataTransfer.dropEffect = `copy`
  e.preventDefault()
  e.stopPropagation()
})

window.addEventListener('drop', async (e) => {
  e.preventDefault()
  if (e.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < e.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (e.dataTransfer.items[i].kind === 'file') {
        const file = e.dataTransfer.items[i].getAsFile()
        ReadFile(file, await file.arrayBuffer())
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < e.dataTransfer.files.length; i++) {
      const file = e.dataTransfer.files[i]
      ReadFile(file, await file.arrayBuffer())
    }
  }
})

export function LoadJSON(json: INode, key = '0', map = {}) {
  const { timeline } = first.$
  if (map[key] === undefined) {
    map[key] = timeline.$.reserve()
  }

  // oh hi
  const id = map[key]
  timeline.$.when(id, json.$[0])
  timeline.$.command(id, json.$[1])
  // who is special!
  if (map[json.$[2]] === undefined) {
    map[json.$[2]] = json.$[2] === timeline.$.reserve()
  }
  timeline.$.who(id, id === 0 ? 0 : map[json.$[2]])
  timeline.$.data0(id, json.$[3])
  timeline.$.data1(id, json.$[4])
  timeline.$.data2(id, json.$[5])

  for (let entry of Object.entries(json._)) {
    LoadJSON(entry[1], entry[0], map)
  }
}

// ReadFile
export function ReadFile(file: File | string, buffer: ArrayBufferLike) {
  const { name } = typeof file === 'string' ? { name: file } : file
  const { timeline } = first.$

  switch (true) {
    case name.indexOf('.json') !== -1:
      try {
        LoadJSON(
          JSON.parse(new TextDecoder('utf-8').decode(new Uint8Array(buffer)))
        )
        timeline.poke()
      } catch (ex) {
        console.log("Couldn't load JSON", file)
      }
      break
    case name.indexOf('.vox') !== -1:
      first.$.voxes.$[name.split('.')[0].slice(0, 12).trim()] =
        new MagickaVoxel(buffer)
      first.$.voxes.poke()
      break
    case name.indexOf('github') !== -1:
    case name.indexOf('.theia') !== -1:
      Load(buffer, first.$)
      break
    case name.indexOf('.mp3') != -1:
    case name.indexOf('.wav') != -1:
    case name.indexOf('.ogg') != -1:
      audio_buffer.set(buffer)
      audio.src = URL.createObjectURL(
        file instanceof File ? file : new File([buffer], file)
      )
      audio.load()
      audio_name.set(name.split('.')[0].slice(0, 12))

      break
  }
}

const cache = {}

export async function ReadURL(url: string) {
  if (!cache[url]) {
    cache[url] = fetch(url).then((r) => r.arrayBuffer())
  }

  return ReadFile(url, await cache[url])
}

if (url.$[0] === '') url.$.pop()

switch (url.$.length) {
  case 0:
    ReadURL(`/github/${rootTheia}`)
    break
  case 2:
    ReadURL(`/github/${url.$[0]}/${url.$[1]}`)
    break
  default:
    // try reading static file and if it misses load DB
    const u = url.$.join('/')

    ReadURL(`/theia/${u}.theia`).catch(() => {
      get(window.location.pathname).then((v) => {
        if (v) {
          Load(v, first.$)
        }

        dbLoaded.set(true)
      })
    })
}
