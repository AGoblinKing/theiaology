mat4 scale(float x, float y, float z) {
	return mat4(vec4(x, 0.0, 0.0, 0.0), vec4(0.0, y, 0.0, 0.0), vec4(0.0, 0.0, z, 0.0), vec4(0.0, 0.0, 0.0, 1.0));
}
mat4 rotationX(in float angle) {
	return mat4(1.0, 0, 0, 0, 0, cos(angle), -sin(angle), 0, 0, sin(angle), cos(angle), 0, 0, 0, 0, 1);
}

mat4 rotationY(in float angle) {
	return mat4(cos(angle), 0, sin(angle), 0, 0, 1.0, 0, 0, -sin(angle), 0, cos(angle), 0, 0, 0, 0, 1);
}

mat4 rotationZ(in float angle) {
	return mat4(cos(angle), -sin(angle), 0, 0, sin(angle), cos(angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
}
const float HAND_DST = 0.5;
float modulator(float x, float y) {
	return x - y * floor(x / y);
}

// Position
vec4 Animation(in vec4 pos) {
	vec3[] pts = vec3[] (leftindex, leftthumb, leftmiddle, leftring, leftpinky, rightindex, rightthumb, rightmiddle, rightring, rightpinky);

	v_animation = float(animation);
	v_matter = vec3(float(matter.x) / NORMALIZER, float(matter.y) / NORMALIZER, float(matter.z) / NORMALIZER);

	if(animation == ANIM_NO_EFFECT) {
		return pos;
	}

	float xyz = pos.x * pos.y * pos.z * 0.01;
	// vibrate sin(xyz  + time  ) * 0.0002 +
	float tes = sin(xyz * 0.01) * 0.01 + sin(xyz + time * 0.0001) * 0.001 + cos(xyz * 10000.) * 0.0025;

	pos.x += tes;
	pos.y += tes + 0.05 * (-audioHigh / 2000.);
	pos.z += tes;

	for(int i = 0; i < 10; i++) {
		vec3 target = pts[i];
		float dist = length(v_pos - target) - sin(time * 0.05) * 0.01;
		if(dist < HAND_DST) {
			pos.xyz = mix(target, pos.xyz, dist / HAND_DST);
		}
	}

	return pos;
}

// Rotations, maybe scale?
mat4 AnimationMatrix(in mat4 mvMatrix) {
	float lav = 0.;

	if(animation != ANIM_NO_EFFECT) {
		lav += audioLow * 0.0525;
	}

	float timescale = time * 0.000001;
	float s = lav;

	mvMatrix = mvMatrix * scale(float(size.x) * shape.x + s, float(size.y) * shape.y, float(size.z) * shape.z + s) * rotationY(sin(timescale * v_pos.x * v_pos.y * v_pos.z) * 10.);

	return mvMatrix;
}
