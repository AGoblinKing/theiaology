#define delta (1.0/60.0)

float modu(float x, float y) {
  return x - y * floor(x/y);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 tmpPos = texture2D(texPos, uv);
    vec3 pos = tmpPos.xyz;

    vec4 tmpVel = texture2D(texThrust, uv);
    
    vec3 vel = tmpVel.xyz * delta;

    pos.x = modu(pos.x + vel.x, 1.0);
    pos.y = modu(pos.y + vel.y, 1.0);
    pos.z = modu(pos.z + vel.z, 1.0);

    gl_FragColor = vec4(pos, 1.0);
}