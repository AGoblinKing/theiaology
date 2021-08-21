import { left_hand_uniforms, right_hand_uniforms } from 'src/input/xr'
import { MeshBasicMaterial } from 'three'
import { lowerUniform, upperUniform } from '../sound/audio'
import { timeUniform } from '../uniform/time'
import AnimationFrag from './animation.frag'
import AnimationVert from './animation.vert'
import EnumVert from './enum.vert'
import HeaderVert from './header.vert'
import MainVert from './main.vert'
import MatterFrag from './matter.frag'
import SpaceTime from './spacetime.vert'

export const material = new MeshBasicMaterial()

const commonVertChunk = [
  '#include <common>',
  HeaderVert,
  EnumVert,
  AnimationVert,
  SpaceTime,
].join('\n')

const fragmentParsChunk = [
  '#include <common>',
  EnumVert,
  MatterFrag,
  AnimationFrag,
].join('\n')

const colorChunk = [
  `vec4 diffuseColor = AnimationFrag(MatterFrag(vec4( diffuse, opacity)));`,
].join('\n')

material.onBeforeCompile = function (shader) {
  shader.uniforms.time = timeUniform
  shader.uniforms.audioLow = lowerUniform
  shader.uniforms.audioHigh = upperUniform
  const addUniform =
    (dir) =>
    ([key, value]) => {
      shader.uniforms[`${dir}${key.split('-')[0]}`] = value
    }

  Object.entries(left_hand_uniforms).forEach(addUniform('left'))
  Object.entries(right_hand_uniforms).forEach(addUniform('right'))

  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', commonVertChunk)
    .replace('#include <project_vertex>', MainVert)

  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', fragmentParsChunk)
    .replace('vec4 diffuseColor = vec4( diffuse, opacity );', colorChunk)
}
