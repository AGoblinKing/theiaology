uniform sampler2D texSize;
uniform float uniSize;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 size = texture2D(texSize, uv) / 2. * uniSize;
    vec4 pos = texture2D(texPos, uv) * uniSize;
    
    vec4 impacts = vec4(0., 0. ,0., 0.);

    // mark collision
    for(int x = 0; x < 256; x++) {
        for(int y = 0; y < 256; y++) {
            vec2 uvo = vec2(float(x) / 256., float(y) / 256.);
            vec4 sizeo = texture2D(texSize, uvo) ;
            vec4 poso = texture2D(texPos, uvo);
            // 
            // // // use step instead of if
            // if(!(poso.x + sizeo.x < pos.x - size.x || poso.x - sizeo.x > pos.x + size.x || poso.y + sizeo.y < pos.y - size.y || poso.y - sizeo.y > pos.y + size.y || poso.z + sizeo.z < pos.z - size.z || poso.z - sizeo.z > pos.z + size.z)) {
            //     //collision
            //     impacts[0] = 1.;
            
               
            // }

        }
    }

    gl_FragColor = impacts;
}