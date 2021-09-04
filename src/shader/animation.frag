uniform float time;
uniform float audioLow;
uniform float audioHigh;

uniform vec3 leftindex;
uniform vec3 leftthumb;
uniform vec3 leftmiddle;
uniform vec3 leftring;
uniform vec3 leftpinky;
uniform vec3 rightindex;
uniform vec3 rightthumb;
uniform vec3 rightmiddle;
uniform vec3 rightring;
uniform vec3 rightpinky;

varying vec3 v_pos;
varying vec3 v_vel;
varying float v_animation;

float modu(float x, float y) {
  return x - y * floor(x/y);
}

vec4 AnimationFrag(in vec4 col) {
	vec3[] pts = vec3[](leftindex, leftthumb, leftmiddle, leftring, leftpinky, rightindex, rightthumb, rightmiddle, rightring, rightpinky);

	float xy = v_pos.x * v_pos.y;
	float xyz = v_pos.z * v_pos.x * v_pos.y;
	col.xyz *= 0.95 + 0.01 * modu(xy * 100.+ time * 0.00001, 2.);
	col.xyz *= 1. + 0.02 * modu(xyz* cos(audioHigh * 0.01)  + time * 0.0001, 5.);
	col.xyz *= 0.95 + 0.01 * modu(xyz * 1000. * cos(audioHigh * 0.01) + time * 0.000001, 4.)* sin(audioLow * 0.01);

	if(v_animation == float(ANIM_NO_EFFECT)) {
		return col;
	}


	for(int i = 0; i < 10; i++) {
		vec3 target = pts[i];

		float dist = length(v_pos - target );
		if(dist < 0.15) {
			col.xyz += sin(dist * 200. - time * 0.025 )* 0.01;
		}
	}
	// col.xyz *= length(v_vel) * 0.01;
	return col;
}
