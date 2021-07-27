import { BoxBufferGeometry, Color, InstancedMesh, Matrix4, MeshBasicMaterial, MeshToonMaterial, Vector3 } from "three";
import { lowerUniform, upperAvg, upperUniform } from "./audio";
import { scene,} from "./render";
import { Value } from "./store";
import { delta, tick, timeUniform } from "./time";

// @ts-ignore
import AnimationVert from './shader/animation.vert'
// @ts-ignore
import AnimationFrag from './shader/animation.frag'
// @ts-ignore
import postVertChunk from './shader/chunkPost.vert'

const SPREAD = 100
const MOVE = 0.5
const COUNT = 100000

const $matrix = new Matrix4()
const $vec3 = new Vector3()
const $color = new Color()

export const material = new MeshBasicMaterial({ color: 0xFFFFFF })

const commonVertChunk = [

    'varying vec3 vInstanceColor;',
    '#include <common>',
    AnimationVert,
  ].join('\n')

  const vertChunk = [
    '#include <begin_vertex>',
    '\tvInstanceColor = instanceColor;',
  ].join('\n')

  const fragmentParsChunk = [
    'varying vec3 vInstanceColor;',
    '#include <common>',
    AnimationFrag,
  ].join('\n')

  const colorChunk = [
    `vec4 diffuseColor = AnimationFrag(vec4( diffuse * vInstanceColor.rgb , opacity)) ;
	`,
  ].join('\n')

material.onBeforeCompile = function(shader) {
    shader.uniforms.time = timeUniform
    shader.uniforms.lowAvg = lowerUniform
    shader.uniforms.highAvg = upperUniform

    shader.vertexShader = shader.vertexShader
        .replace('#include <common>', commonVertChunk)
        .replace('#include <begin_vertex>', vertChunk)
        .replace('#include <project_vertex>', postVertChunk)

    shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', fragmentParsChunk)
        .replace('vec4 diffuseColor = vec4( diffuse, opacity );', colorChunk)
}

export const meshes = new Value(new InstancedMesh(new BoxBufferGeometry(0.1, 0.1 ,0.1), material, COUNT))

tick.on(($t) => {
    const mv = MOVE * delta.$ * upperAvg.$

    for(let i = 0; i < meshes.$.count; i++) {
        if($t === 0) {   
            meshes.$.setMatrixAt(i, $matrix.setPosition(Math.random() * SPREAD - SPREAD/2, Math.random() * SPREAD - SPREAD/2, Math.random() * SPREAD - SPREAD/2))
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
