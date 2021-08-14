vec4 SpaceTime(in vec4 pos) {
    return pos + vec4(

        mix(  
            vec3(past.xyz) * 0.001, 
            vec3(future.xyz)*0.001, 
            max(0.0, min(1.1, (time - float(past.a)) / float((future.a - past.a))))
        ), 1.0
    );
}