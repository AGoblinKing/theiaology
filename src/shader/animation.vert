uniform float time;
uniform float highAvg;
uniform float lowAvg;

attribute int animation;

varying vec3 v_pos;

mat4 scale(float x, float y, float z){
    return mat4(
        vec4(x,   0.0, 0.0, 0.0),
        vec4(0.0, y,   0.0, 0.0),
        vec4(0.0, 0.0, z,   0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}

// Animation enums

const int ANIM_NORMAL = 0;
const int ANIM_NO_EFFECT = 1;

// Position
vec4 Animation(in vec4 pos) {
	if(animation == ANIM_NO_EFFECT) {
		return pos;
	}

	float tes = sin(pos.x * pos.y *pos.z  + time * 0.0001  ) * 0.04 ;

	pos.x += tes;
	pos.y += tes +  (-highAvg/2000.);
	pos.z += tes;

	return pos;
}


// Rotations, maybe scale?
mat4 AnimationMatrix(in mat4 mvMatrix) {

    float lav = (1. + lowAvg * 0.0005);

    mvMatrix = mvMatrix * scale(lav, lav, lav);
	return mvMatrix;
}

