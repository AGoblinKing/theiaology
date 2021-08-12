

mat4 scale(float x, float y, float z){
    return mat4(
        vec4(x,   0.0, 0.0, 0.0),
        vec4(0.0, y,   0.0, 0.0),
        vec4(0.0, 0.0, z,   0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}

const float HAND_DST = 0.4;
float modulator(float x, float y) {
  return x - y * floor(x/y);
}

// Position
vec4 Animation(in vec4 pos) {
	v_animation = float(animation);
	v_matter = vec3(float(matter.x)/NORMALIZER, float(matter.y)/NORMALIZER, float(matter.z)/NORMALIZER);
	v_vel = vec3(velocity);

	if(animation == ANIM_NO_EFFECT) {
		return pos;
	}

	float xyz = pos.x * pos.y *pos.z;
	float tes = sin(xyz  + time * 1.  ) * 0.005 +
	sin(xyz  + time * 0.0005  ) * 0.05 +
	sin(xyz  + time * 0.001  ) * 0.01;

	pos.x += tes;
	pos.y += tes +  0.05 * (-audioHigh/2000.);
	pos.z += tes;

	float dist = length(v_pos - handLeft);
	if(dist < HAND_DST) {
		pos.xyz = mix(handLeft,pos.xyz,  dist/ HAND_DST);
	}
	float dist2 = length(v_pos - handRight);
	if(dist2 < HAND_DST) {
		pos.xyz = mix(handRight,pos.xyz, dist2 / HAND_DST);
	}
	return pos;
}


// Rotations, maybe scale?
mat4 AnimationMatrix(in mat4 mvMatrix) {
	if(animation == ANIM_NO_EFFECT) {
		return mvMatrix;
	}
    float lav = (1. + audioLow * 0.0002);

    mvMatrix = mvMatrix * scale(lav * float(size.x), lav * float(size.y), float(size.z) * lav);
	return mvMatrix;
}

