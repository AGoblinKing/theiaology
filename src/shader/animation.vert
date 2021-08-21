

mat4 scale(float x, float y, float z){
    return mat4(
        vec4(x,   0.0, 0.0, 0.0),
        vec4(0.0, y,   0.0, 0.0),
        vec4(0.0, 0.0, z,   0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}

const float HAND_DST = 0.25;
float modulator(float x, float y) {
  return x - y * floor(x/y);
}

// Position
vec4 Animation(in vec4 pos) {
	vec3[] pts = vec3[](leftindex, leftthumb, leftmiddle, leftring, leftpinky, rightindex, rightthumb, rightmiddle, rightring, rightpinky);

	v_animation = float(animation);
	v_matter = vec3(float(matter.x)/NORMALIZER, float(matter.y)/NORMALIZER, float(matter.z)/NORMALIZER);
	v_vel = vec3(velocity);

	if(animation == ANIM_NO_EFFECT) {
		return pos;
	}

	float xyz = pos.x * pos.y *pos.z;
	float tes = sin(xyz  + time * 1.  ) * 0.0001 +
	
	sin(xyz  ) * 0.03;

	pos.x += tes;
	pos.y += tes +  0.05 * (-audioHigh/2000.);
	pos.z += tes;

	for(int i = 0; i < 10; i++) {
		vec3 target = pts[i];
		float dist = length(v_pos - target );
		if(dist < HAND_DST) {
			pos.xyz = mix(target, pos.xyz, dist/ HAND_DST);
		}
	}

	return pos;
}


// Rotations, maybe scale?
mat4 AnimationMatrix(in mat4 mvMatrix) {
	

	float lav = 1.;

	if(animation != ANIM_NO_EFFECT) {
    	lav += audioLow * 0.00125;
	}

    mvMatrix = mvMatrix * scale(lav * float(size.x), lav * float(size.y), float(size.z) * lav);
	return mvMatrix;
}

