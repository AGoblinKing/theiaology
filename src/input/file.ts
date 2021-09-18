import { get } from 'idb-keyval'
import { rootTheia } from 'src/config'
import { audio, audio_buffer, audio_name } from 'src/controller/audio'
import { multiplayer, url } from 'src/input/browser'
import { MagickaVoxel } from 'src/magica'
import { first } from 'src/realm'
import { dbLoaded, Load } from './load'
import { Save } from './save'

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

// ReadFile
export function ReadFile(file: File | string, buffer: ArrayBufferLike) {
  const { name } = typeof file === 'string' ? { name: file } : file

  switch (true) {
    case /lisp$/.test(name):
      first.$.fate.$.fromScript(
        name.replace('.lisp', ''),
        new TextDecoder('utf-8').decode(new Uint8Array(buffer))
      )
      first.$.fate.poke()
      Save(false)
      break
    case /vox$/.test(name):
      first.$.voxes.$[name.split('.')[0].slice(0, 12).trim()] =
        new MagickaVoxel(buffer)
      first.$.voxes.poke()
      Save(false)
      break
    case name.indexOf('.fate') !== -1:
    case name.indexOf('github') !== -1:
    case name.indexOf('.theia') !== -1:
      Load(buffer, first.$)
      Save(false)
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
      Save(false)
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

export function LoadRealm() {
  switch (url.$.length) {
    case 0:
      ReadURL(`/github/${rootTheia}`)
      break
    case 2:
      ReadURL(`/github/${url.$[0]}/${url.$[1]}`).catch(() => {
        get(window.location.pathname).then((v) => {
          if (v) {
            Load(v, first.$)
          }

          dbLoaded.set(true)
        })
      })
      break
    case 1:
      // try reading static file and if it misses load DB
      const u = url.$.join('/')

      ReadURL(`/github/agoblinking/${u}`).catch(() => {
        get(window.location.pathname).then((v) => {
          if (v) {
            Load(v, first.$)
          }

          dbLoaded.set(true)
        })
      })
    default:
      get(window.location.pathname).then((v) => {
        if (v) {
          Load(v, first.$)
        }

        dbLoaded.set(true)
      })
  }
}

if (multiplayer === '') {
  LoadRealm()
}
