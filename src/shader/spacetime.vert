// uniform float time;  already imported 
attribute vec4 past;
attribute vec4 future;

vec4 SpaceTime(in vec4 pos) {
    return pos + mix(past, future, max(0.0, min(1.0, (time - past.a) / (future.a - past.a))));
}