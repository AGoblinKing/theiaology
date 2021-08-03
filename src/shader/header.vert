uniform float time;
uniform float audioHigh;
uniform float audioLow;
uniform vec3 handLeft;
uniform vec3 handRight;

attribute int animation;
attribute ivec3 velocity;
attribute ivec3 matter;
attribute ivec4 past;
attribute ivec4 future;

varying vec3 v_pos;
varying float v_animation;
