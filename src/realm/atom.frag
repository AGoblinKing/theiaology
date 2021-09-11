uniform sampler2D texColor;

varying vec2 v_reference;

void main() {
    vec4 col = texture2D(texColor, v_reference);

    // don't blow the colorspace
    gl_FragColor = col;
}