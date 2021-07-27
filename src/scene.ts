import { AmbientLight, BoxBufferGeometry, Color, DirectionalLight, Euler, InstancedMesh, Matrix4, MeshBasicMaterial, MeshToonMaterial, Quaternion, Vector3 } from "three";
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
import { mouse_left, mouse_right } from "./input";

const SIZE = 0.1

const SPREAD = 1
const MOVE = 1
const COUNT = 50000
const rotMat = new Matrix4().makeRotationFromQuaternion(new Quaternion().setFromEuler(new Euler(0.01, -0.01, 0)))

const $matrix = new Matrix4()
const $vec3 = new Vector3()
const $color = new Color()

export const material = new MeshToonMaterial({ color: 0xFFFFFF })

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

export const meshes = new Value(new InstancedMesh(new BoxBufferGeometry(SIZE, SIZE, SIZE), material, COUNT))

tick.on(($t) => {
    const mv = MOVE * delta.$ * upperAvg.$
    const divisor = mouse_left.$ ? 0.95 : mouse_right.$ ? 1.05 : 1 
    for(let i = 0; i < meshes.$.count; i++) {
        if($t === 0) {   
            meshes.$.setMatrixAt(i, $matrix.setPosition(Math.random() * SPREAD - SPREAD/2, Math.random() * SPREAD - SPREAD/2, Math.random() * SPREAD - SPREAD/2))
            meshes.$.setColorAt(i, $color.setHex(Math.floor(0xFFFFFF * Math.random())))
        } else {
            
            meshes.$.getMatrixAt(i, $matrix)
            $vec3.setFromMatrixPosition($matrix).multiplyScalar(divisor)
            meshes.$.setMatrixAt(i, $matrix.setPosition($vec3.x + Math.random() * mv - mv/2, $vec3.y + Math.random() * mv - mv/2, $vec3.z + Math.random() * mv - mv/2).multiply(rotMat))
        }
    }
    meshes.$.instanceMatrix.needsUpdate = true
})

const under = new AmbientLight(0xFFFFFF, 0.5)

const over = new DirectionalLight(0xFFFFFF, 1)
over.position.set(0, 1, 1)
scene.$.add(meshes.$, over, under)