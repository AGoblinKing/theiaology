uniform sampler2D colorTex;

varying vec2 v_reference;
varying float v_collide;

void main() {
    vec4 col = texture2D(colorTex, v_reference);

    //col = mix(col, vec4(1.0, 0.0, 0.0, 1.0), v_collide);
    gl_FragColor = vec4(col.xyz, 1.0);
}