vec4 SpaceTime(in vec4 pos) {

    float tf = (time - float(past.a))/float(future.a - past.a);
    return pos + vec4(

        mix(  
            vec3(past.xyz) * 0.001, 
            vec3(future.xyz) * 0.001, 
            max(0.0, min(1., tf))
        ), 1.0
    );
}