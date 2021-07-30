import { Matrix4, Vector3 } from 'three'
import { audio } from './audio'
import { MagickaVoxel } from './magica'
import { Voxel, voxels, voxels_static } from './vox'

export const SPAWN_DISTRO = 100

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

const $vec3 = new Vector3()

// ReadFile
export function ReadFile(
  file: File | string,
  buffer: ArrayBufferLike,
  offset?: Matrix4,
  canSleep?: boolean
) {
  const { name } = typeof file === 'string' ? { name: file } : file
  switch (true) {
    case name.indexOf('.vox') != -1:
      ;(canSleep ? voxels_static : voxels).push(
        new Voxel(
          new Matrix4()
            .identity()
            .copy(offset || $matrix)
            .setPosition(
              $vec3.set(
                SPAWN_DISTRO * Math.random() - SPAWN_DISTRO / 2,
                0,
                SPAWN_DISTRO * Math.random() - SPAWN_DISTRO / 2
              )
            ),
          new MagickaVoxel(buffer)
        )
      )

      break
    case name.indexOf('.mp3') != -1:
    case name.indexOf('.wav') != -1:
    case name.indexOf('.ogg') != -1:
      audio.src = URL.createObjectURL(file)
      audio.load()
      audio.play()
      break
  }
}

const $matrix = new Matrix4()
const cache = {}

export async function ReadURL(
  url: string,
  offset?: Matrix4,
  canSleep?: boolean
) {
  if (!cache[url]) {
    cache[url] = fetch(url).then((r) => r.arrayBuffer())
  }

  ReadFile(url, await cache[url], offset, canSleep)
}
