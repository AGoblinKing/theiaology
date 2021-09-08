uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 tmpThrust = texture2D(texThrust, uv);
    vec3 thrust = tmpThrust.xyz;

    float tScale = 0.05 * time;

    thrust.x = sin(uv.x * 3.14) * 0.5 + 0.5;
    thrust.y = sin(uv.x* 3.14) * 0.5 + 0.5;
    thrust.z = sin(tScale + uv.x * 3.14) * 0.5 + 0.5;

    gl_FragColor = vec4(thrust, 1.0);
}