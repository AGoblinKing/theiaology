uniform float time;
uniform float audioHigh;
uniform float audioLow;
uniform vec3 handLeft;
uniform vec3 handRight;

attribute int animation;
attribute ivec3 velocity;
attribute ivec3 size;
attribute ivec4 past;
attribute ivec4 future;
attribute ivec4 matter;

varying vec3 v_pos;
varying float v_animation;
varying vec3 v_matter;
varying vec3 v_vel;

const float NORMALIZER = float(0x7fffffff);