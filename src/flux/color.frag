
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 color = texture2D(texColor, uv);
    vec4 impact = texture2D(texImpact, uv);

    color = mix(color, ceil(impact), ceil(impact.x));
    gl_FragColor = color;
}