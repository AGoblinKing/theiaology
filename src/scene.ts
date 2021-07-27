import { BoxBufferGeometry, Color, InstancedMesh, Matrix4, MeshBasicMaterial, Vector3 } from "three";
import { delta, scene, tick } from "./render";
import { Value } from "./store";

const SPREAD = 10
const MOVE = 1
const COUNT = 1000

const $matrix = new Matrix4()
const $vec3 = new Vector3()
const $color = new Color()

export const meshes = new Value(new InstancedMesh(new BoxBufferGeometry(0.1, 0.1 ,0.1), new MeshBasicMaterial({ color: 0xFFFFFF }), COUNT))

tick.on(($t) => {
    const mv = MOVE * delta.$

    for(let i = 0; i < meshes.$.count; i++) {
        if($t === 0) {   
            meshes.$.setMatrixAt(i, $matrix.setPosition(Math.random() * SPREAD - SPREAD/2, Math.random() * SPREAD - SPREAD/2, -Math.random() * SPREAD))
            meshes.$.setColorAt(i, $color.setHex(Math.floor(0xFFFFFF * Math.random())))
        } else {
            
            meshes.$.getMatrixAt(i, $matrix)
            $vec3.setFromMatrixPosition($matrix)
            meshes.$.setMatrixAt(i, $matrix.setPosition($vec3.x + Math.random() * mv - mv/2, $vec3.y + Math.random() * mv - mv/2, $vec3.z + Math.random() * mv - mv/2))
        }
    }
    meshes.$.instanceMatrix.needsUpdate = true
})

scene.$.add(meshes.$)
