attribute vec2 reference;

uniform sampler2D texPos;
uniform sampler2D texSize;

// for converting from the normals 1.0 to xyz

// these are for rendering
uniform vec3 offset;
uniform float uniSize;
varying vec2 v_reference;

void main() {
    v_reference = reference;
    vec4 size = texture2D(texSize, reference) * uniSize;
    vec4 pos = texture2D(texPos, reference) * uniSize;

    vec3 update = position * size.xyz + pos.xyz + offset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(update, 1.0);
}