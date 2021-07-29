import { MeshToonMaterial } from 'three'
import { lowerUniform, upperUniform } from './audio'
// @ts-ignore
import AnimationFrag from './shader/animation.frag'
// @ts-ignore
import AnimationVert from './shader/animation.vert'
// @ts-ignore
import postVertChunk from './shader/chunkPost.vert'
import { timeUniform } from './time'

export const material = new MeshToonMaterial({ color: 0xffffff })

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

material.onBeforeCompile = function (shader) {
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
