uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 tmpThrust = texture2D(texThrust, uv);
    vec3 thrust = tmpThrust.xyz;

    float tScale = 0.0005 * time;

    thrust.x = sin( uv.x * uv.y * 3.14 * 10.) * 0.5 + 0.5;
    thrust.y = sin(uv.x * uv.y  * 10.) * 0.5 + 0.5;
    thrust.z =   thrust.x;

    gl_FragColor = vec4(thrust, 1.0);
}