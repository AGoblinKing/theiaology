import { audio, audio_buffer, audio_name } from './audio'
import { timeline } from './buffer'
import { Load } from './file/load'
import { MagickaVoxel } from './magica'
import { voxes } from './vox'

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
    case name.indexOf('.vox') !== -1:
      console.log(name)
      voxes.$[name.slice(12)] = new MagickaVoxel(buffer)
      voxes.poke()
      timeline.poke()
      break
    case name.indexOf('.theia') !== -1:
      Load(buffer)
      break
    case name.indexOf('.mp3') != -1:
    case name.indexOf('.wav') != -1:
    case name.indexOf('.ogg') != -1:
      audio_buffer.set(buffer)
      audio.src = URL.createObjectURL(
        file instanceof File ? file : new File([buffer], file)
      )
      audio.load()
      audio_name.set(name.split('.')[0].slice(16))

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
