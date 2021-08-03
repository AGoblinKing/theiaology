

vec4 SpaceTime(in vec4 pos) {
    //+ mix(past, future, max(0.0, min(1.0, (time - past.a) / (future.a - past.a))));
    float fa = float(past.w);

    return vec4(
        pos.xyz + 0.0000000000005 * mix(
            vec3(past.xyz), vec3(future.xyz), max(
                0.0, min(
                    1.0, (time * 1000. - float(past.a)) / float(future.a - past.a)
                )
            ))
        , 1.0
    );
}