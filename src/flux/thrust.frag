
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 tmpThrust = texture2D(texThrust, uv);
    vec3 thrust = tmpThrust.xyz;

    gl_FragColor = vec4(thrust, 1.0);
}