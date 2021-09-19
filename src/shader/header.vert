uniform float time;
uniform float audioHigh;
uniform float audioLow;
uniform vec3 shape;

uniform vec3 leftindex;
uniform vec3 leftthumb;
uniform vec3 leftmiddle;
uniform vec3 leftring;
uniform vec3 leftpinky;
uniform vec3 rightindex;
uniform vec3 rightthumb;
uniform vec3 rightmiddle;
uniform vec3 rightring;
uniform vec3 rightpinky;

attribute int animation;
attribute ivec3 size;
attribute ivec4 past;
attribute ivec4 future;
attribute ivec3 matter;

varying vec3 v_pos;
varying float v_animation;
varying vec3 v_matter;

const float NORMALIZER = float(0x7fffffff);