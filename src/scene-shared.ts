import { BoxBufferGeometry, Color, Euler, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, Vector3 } from "three";
import { scene } from "./render";
import { Value } from "./store";
import { tick } from "./time";

const COUNT = 100000
const SPREAD = 10
const $color = new Color()
const $matrix = new Matrix4()

export const meshes = new Value(new InstancedMesh(new BoxBufferGeometry(0.01, 0.01 ,0.01), new MeshBasicMaterial({ color: 0xFFFFFF }), COUNT))

// // switchero the array out from under them
const sharedBuffer = new SharedArrayBuffer(COUNT * 16 * 4)
meshes.$.instanceMatrix.array = new Float32Array(sharedBuffer)


for(let i = 0; i < meshes.$.count; i++) {
    meshes.$.setMatrixAt(i, $matrix.setPosition(Math.random() * SPREAD - SPREAD/2, Math.random() * SPREAD - SPREAD/2, -Math.random() * SPREAD))
    meshes.$.setColorAt(i, $color.setHex(Math.floor(0xFFFFFF * Math.random())))
}
meshes.$.instanceMatrix.needsUpdate = true

const worker = new Worker('build/worker.js')
worker.postMessage(sharedBuffer)

scene.$.add(meshes.$)


tick.on(() => {
    meshes.$.instanceMatrix.needsUpdate = true
})