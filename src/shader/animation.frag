uniform float time;
uniform float lowAvg;

varying vec3 v_pos;

float modu(float x, float y) {
  return x - y * floor(x/y);
}

vec4 AnimationFrag(in vec4 col) {
	col.xyz *= (1. + sin(time * 0.0001 + v_pos.x * v_pos.y * 0.02 * 100. )/3. * 0.25) ;
	col.xyz *= (1. + sin(time * 0.001 + v_pos.x * v_pos.y*v_pos.z * 100. * 0.02 )/3. * 0.055) ;

	if(modu(abs(v_pos.x * v_pos.y * 100. + time * 0.0001) , 2.) >= 1.) {
		col.xyz *= 0.9;
	}

	if(modu(abs(v_pos.z * v_pos.x * v_pos.y * 100.) + time * 0.0001, 4.) >= 1.) {
		col.xyz *= 0.9;
	}


	col.xyz *= 0.95 + 0.05 * sin(lowAvg * 0.01);

	return col;
}
