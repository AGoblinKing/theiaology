uniform float time;
uniform float highAvg;
uniform float lowAvg;

varying vec3 v_pos;

mat4 scale(float x, float y, float z){
    return mat4(
        vec4(x,   0.0, 0.0, 0.0),
        vec4(0.0, y,   0.0, 0.0),
        vec4(0.0, 0.0, z,   0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}

mat4 translate(float x, float y, float z){
    return mat4(
        vec4(1.0, 0.0, 0.0, 0.0),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(x,   y,   z,   1.0)
    );
}

mat4 rotationX( in float angle ) {
	return mat4(	1.0,		0,			0,			0,
			 		0, 	cos(angle),	-sin(angle),		0,
					0, 	sin(angle),	 cos(angle),		0,
					0, 			0,			  0, 		1);
}

mat4 rotationY( in float angle ) {
	return mat4(	cos(angle),		0,		sin(angle),	0,
			 				0,		1.0,			 0,	0,
					-sin(angle),	0,		cos(angle),	0,
							0, 		0,				0,	1);
}

mat4 rotationZ( in float angle ) {
	return mat4(	cos(angle),		-sin(angle),	0,	0,
			 		sin(angle),		cos(angle),		0,	0,
							0,				0,		1,	0,
							0,				0,		0,	1);
}

float modu(float x, float y) {
  return x - y * floor(x/y);
}

mat4 billboard(in mat4 mv) {

	mv[0][0] = 1.0;
	mv[0][1] = 0.0;
	mv[0][2] = 0.0;
	
	mv[2][0] = 0.0;
	mv[2][1] = 0.0;
	mv[2][2] = 1.0;

	return mv;
}

vec4 Slerp(vec4 q0, vec4 q1, float a) {
	float dotp = dot(normalize(q0), normalize(q1));

    if ((dotp > 0.9999) || (dotp<-0.9999))
    {
        if (a<=0.5) {
        return q0;
            }
        return q1;
    }

    float theta = acos(dotp);
    vec4 P = ((q0*sin((1.-a)*theta) + q1*sin(a*theta)) / sin(theta));
    P.w = 1.;
    return P;
}

vec4 quatFromMat(in mat4 m) {
	vec4 qt = vec4(0., 0., 0., 0.);

	float trace = m[1][1] + m[2][2] + m[3][3];

	if(trace > 0.) {
		float s = 0.5 / sqrt(trace+1.);

		qt.w = 0.25 / s;
		qt.x = (m[3][2] - m[2][3]) * s;
		qt.y = (m[1][3] - m[3][1]) * s;
		qt.z = (m[2][1] - m[1][2]) * s;
	} else if (m[1][1] > m[2][2] && m[1][1] > m[3][3]) {
		float s = 2. * sqrt(1.+m[1][1]-m[2][2]-m[3][3]);

		qt.w = (m[3][2] - m[2][3]) / s;
		qt.x = 0.25 * s;
		qt.y = (m[1][2] + m[2][1]) / s;
		qt.z = (m[1][3] + m[3][1]) / s;
} else if( m[2][2] > m[3][3]) {
		float s = 2. * sqrt(1.+m[2][2]-m[1][1]-m[3][3]);

		qt.w = (m[1][3] - m[3][1]) / s;
		qt.x = (m[1][2] + m[2][1]) / s;
		qt.y = 0.25 * s;
		qt.z = (m[2][3] + m[3][2]) / s;
	} else {
		float s = 2. * sqrt(1.+m[3][3]-m[1][1]-m[2][2]);

		qt.w = (m[2][1] - m[1][2]) / s;
		qt.x = (m[1][3] + m[3][1]) / s;
		qt.y = (m[2][3] + m[3][2]) / s;
		qt.z = 0.25 * s;
	}

	return qt;
}

// Position
vec4 Animation(in vec4 pos) {
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


mat4 InterpolateMatrix(in mat4 mvMatrix
) {

	return mvMatrix;
}