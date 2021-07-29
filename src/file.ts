import { Matrix4 } from 'three'
import { context } from './audio'
import { MagickaVoxel } from './magica'
import { Voxel, voxels } from './vox'

export const SPAWN_DISTRO = 20

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
        ReadFile(file.name, await file.arrayBuffer())
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < e.dataTransfer.files.length; i++) {
      const file = e.dataTransfer.files[i]
      ReadFile(file.name, await file.arrayBuffer())
    }
  }
})

// ReadFile
export function ReadFile(name: string, buffer: ArrayBufferLike) {
  switch (true) {
    case name.indexOf('.vox') != -1:
      voxels.push(
        new Voxel(
          new Matrix4().setPosition(
            SPAWN_DISTRO * Math.random() - SPAWN_DISTRO / 2,
            0,
            SPAWN_DISTRO * Math.random() - SPAWN_DISTRO / 2
          ),
          new MagickaVoxel(buffer)
        )
      )

      break
    case name.indexOf('.mp3') != -1 ||
      name.indexOf('.wav') != -1 ||
      name.indexOf('.ogg') != -1:
      context.$.decodeAudioData(buffer, (data) => {
        const source = context.$.createBufferSource()
        source.buffer = data
        source.connect(context.$.destination)
        source.start()
      })
      break
  }
}

export async function ReadURL(url: string) {
  const r = await fetch(url)
  ReadFile(url, await r.arrayBuffer())
}
