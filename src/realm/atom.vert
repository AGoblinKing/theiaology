attribute vec2 reference;

uniform sampler2D positionTex;
uniform sampler2D sizeTex;

mat4 scale(float x, float y, float z) {
    return mat4(vec4(x, 0.0, 0.0, 0.0), vec4(0.0, y, 0.0, 0.0), vec4(0.0, 0.0, z, 0.0), vec4(0.0, 0.0, 0.0, 1.0));
}

varying vec2 v_reference;
varying float v_collide;

void main() {
    v_collide = 0.;
    v_reference = reference;
    vec4 pos = texture2D(positionTex, reference);
    vec4 size = texture2D(sizeTex, reference) / 2.0;

    // mark collision
    for(int x = 0; x < 256; x++) {
        for(int y = 0; y < 256; y++) {
            vec2 refo = vec2(float(x) / 256., float(y) / 256.);
            vec4 sizeo = texture2D(positionTex, refo) / 2.0;
            vec4 poso = texture2D(sizeTex, refo);

            // use step instead of if
            if(!(poso.x + sizeo.x < pos.x - size.x || poso.x - sizeo.x > pos.x + size.x || poso.y + sizeo.y < pos.y - size.y || poso.y - sizeo.y > pos.y + size.y || poso.z + sizeo.z < pos.z - size.z || poso.z - sizeo.z > pos.z + size.z)) {
                //collision
                v_collide = 1.0;
            }
        }
    }

    gl_Position = projectionMatrix * modelViewMatrix * scale(size.x, size.y, size.z) * vec4(position + pos.xyz, 1.0);
}