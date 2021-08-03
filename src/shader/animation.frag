uniform float time;
uniform float audioLow;
uniform vec3 handLeft;
uniform vec3 handRight;

varying vec3 v_pos;
varying float v_animation;

float modu(float x, float y) {
  return x - y * floor(x/y);
}

vec4 AnimationFrag(in vec4 col) {

	if(modu(abs(v_pos.x * v_pos.y * 100. + time * 0.0001) , 2.) >= 1.) {
		col.xyz *= 0.90;
	}

	if(modu(abs(v_pos.z * v_pos.x * v_pos.y * 10.) + time * 0.0001, 4.) >= 1.) {
		col.xyz *= 0.90;
	}

	col.xyz *= 0.95 + 0.05 * sin(audioLow * 0.01);
	if(v_animation == float(ANIM_NO_EFFECT)) {
		return col;
	}

    // muck with color based on distance from hands
	float dist = length(v_pos - handLeft);
	if(dist < 0.15) {
		col.xyz += abs(sin(dist * 200. + time ));
	}
	float dist2 = length(v_pos - handRight);
	if(dist2 < 0.15) {
		col.xyz +=abs(sin(dist2 * 200. + time));
	}
	return col;
}
