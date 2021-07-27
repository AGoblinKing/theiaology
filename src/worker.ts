// handle postMessage and update the sharedarraybuff
import { Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import { delta, Loop, tick } from './time'

const MOVE = 1

const $matrix = new Matrix4()
const $vec3 = new Vector3()

const rotMat = new Matrix4().makeRotationFromQuaternion(
  new Quaternion().setFromEuler(new Euler(0.1, -0.1, 0))
)

let meshes: InstancedMesh

tick.on(($t) => {
  if (meshes === undefined) return

  const mv = MOVE * delta.$

  for (let i = 0; i < meshes.count; i++) {
    meshes.getMatrixAt(i, $matrix)
    $vec3.setFromMatrixPosition($matrix)
    meshes.setMatrixAt(
      i,
      $matrix
        .setPosition(
          $vec3.x + Math.random() * mv - mv / 2,
          $vec3.y + Math.random() * mv - mv / 2,
          $vec3.z + Math.random() * mv - mv / 2
        )
        .multiply(rotMat)
    )
  }
})

self.onmessage = function mainMessage(msg) {
  const arr = new Float32Array(msg.data)

  meshes = new InstancedMesh(undefined, undefined, arr.length / 16)

  meshes.instanceMatrix.array = arr
}

setInterval(Loop, 100)
