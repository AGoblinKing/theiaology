

vec4 SpaceTime(in vec4 pos) {
    //+ mix(past, future, max(0.0, min(1.0, (time - past.a) / (future.a - past.a))));
    float fa = float(past.w);

    return vec4(
        pos.xyz +vec3(future.xyz), 1.0
    );
}