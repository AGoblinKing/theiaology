uniform float time;
uniform float audioLow;
uniform mat4 handLeft;
uniform mat4 handRight;

varying vec3 v_pos;
varying vec3 v_vel;
varying float v_animation;

float modu(float x, float y) {
  return x - y * floor(x/y);
}
float MatIndex(int i, in mat4 target) {
	int x = (i * 3) % 4;
	int y = i/4;

	return target[x][y];
}
vec4 AnimationFrag(in vec4 col) {

	if(modu(abs(v_pos.x * v_pos.y * 100. + time * 0.0001) , 2.) >= 1.) {
		col.xyz *= 0.95;
	}

	if(modu(abs(v_pos.z * v_pos.x * v_pos.y * 10.) + time * 0.0001, 4.) >= 1.) {
		col.xyz *= 0.95;
	}

	col.xyz *= 1. - 0.05 * sin(audioLow * 0.01);
	
	if(v_animation == float(ANIM_NO_EFFECT)) {
		return col;
	}


 for(int i = 0; i < 5; i++) {
	vec3 target = vec3(MatIndex(i*3, handLeft), MatIndex(i*3+1, handLeft), MatIndex(i*3+2, handLeft));
	float dist = length(v_pos - target );
	if(dist < 0.15) {
		col.xyz += sin(dist * 200. + time * 0.005 )* 0.05;
	}
 }
    // muck with color based on distance from hands
	

	// col.xyz *= length(v_vel) * 0.01;
	return col;
}
