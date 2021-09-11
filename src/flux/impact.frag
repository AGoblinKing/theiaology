uniform sampler2D texSize;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 size = texture2D(texSize, uv) / 2. ;
    vec4 pos = texture2D(texPos, uv);
    
    vec4 impacts = vec4(0., 0. ,0., 0.);

    int i = 0;

    // mark collision
    for(int x = 0; x < 256; x++) {
        for(int y = 0; y < 256; y++) {
            vec2 uvo = vec2(float(x) / 256., float(y) / 256.);
            vec4 sizeo = texture2D(texSize, uvo) ;
            vec4 poso = texture2D(texPos, uvo);

            // use step instead of if
            if(!(poso.x + sizeo.x < pos.x - size.x || poso.x - sizeo.x > pos.x + size.x || poso.y + sizeo.y < pos.y - size.y || poso.y - sizeo.y > pos.y + size.y || poso.z + sizeo.z < pos.z - size.z || poso.z - sizeo.z > pos.z + size.z)) {
                //collision
                impacts[i++] = 1.;
                if(i == 4) {
                    gl_FragColor = impacts;
                    return;
                }
            }
        }
    }

    gl_FragColor = impacts;
}