uniform vec3 cage;
uniform vec3 cageM;
uniform vec3 offset;

vec4 SpaceTime(in vec4 pos) {

    float tf = (time - float(past.a))/float(future.a - past.a);

    
    vec4 space = vec4(
        mix(  
            vec3(past.xyz) * 0.001, 
            vec3(future.xyz) * 0.001, 
            max(0.0, min(1., tf))
        ), 1.0
    );

    // clamp x/y/z to universal bounds
    space.x = min(cageM.x, max(cage.x, space.x)) + offset.x * 0.01;
    space.y = min(cageM.y, max(cage.y, space.y)) + offset.y * 0.01;
    space.z = min(cageM.z, max(cage.z, space.z)) + offset.z * 0.01;

    return pos + space; 
}