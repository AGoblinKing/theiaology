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

uniform sampler2D texmap;

varying vec3 v_pos;
varying vec3 a_pos;
varying vec2 vUv;
varying float sprite;

varying float v_animation;

float modu(float x, float y) {
	return x - y * floor(x / y);
}

vec4 AnimationFrag(in vec4 col) {
	vec3[] pts = vec3[] (leftindex, leftthumb, leftmiddle, leftring, leftpinky, rightindex, rightthumb, rightmiddle, rightring, rightpinky);

	float v = 50000000.;
	float xy = modu(v_pos.x * v_pos.y, v);
	float xyz = modu(v_pos.z * v_pos.x * v_pos.y, v);
	float magic = 12.;
	float scale = 1.0 / magic;

	vec2 offsets = vec2(mod(sprite, magic), floor(sprite / magic));
	vec4 texelColor = texture2D(texmap, vec2(vUv.x * scale + scale * offsets.x, 1. - (vUv.y * scale + scale * offsets.y)));
    // apply color/alpha to texel color
	col += texelColor * 0.10;
	col.xyz *= 0.99 + 0.005 * modu(xy * 100., 2.);
	col.xyz *= 0.99 + 0.005 * modu(xyz * cos(audioHigh * 0.001), 5.);
	col.xyz *= 0.99 + 0.005 * modu(xyz * 1000. * cos(audioHigh * 0.01), 4.) * sin(audioLow * 0.01);

    // DISCARD
	if(v_animation == 3.) {
		discard;
		return col;
	}

    // OFF
	if(v_animation == 1.) {
		return col;
	}

	// GATE
	if(v_animation == 4.) {
		float v =  time * 0.01;
		col.xyz += sin(v_pos.x * 10. + v) * 0.1 + cos(v_pos.y * 10. + v) * 0.1;
	
	}

	float outro = 1. + sin(time * 0.001) * 0.01;

	// allow some room for lightening
	//col.xyz *= 0.90 + 0.01 * modu(v_pos.y, 1.);
	for(int i = 0; i < 10; i++) {
		vec3 target = pts[i];

		float dist = length(a_pos - target) * outro;
		if(dist < 1.5) {
			col.xyz += (2.5 - dist * dist) / 2.5 * 0.01;
		}
		if(dist < 3.) {
			col.xyz -= (2.5 - dist * dist) / 2.5 * 0.001;
		}
		if(dist < 15.) {
			col.xyz -= (15. - dist * dist) / 15. * 0.0001;
		}

		if(dist < 30.) {
			col.xyz -= (30. - dist * dist) / 30. * 0.0001;
		}

		if(dist < 60.) {
			col.xyz -= (60. - dist * dist) / 60. * 0.00005;
		}
		if(dist < 120.) {
			col.xyz -= (120. - dist * dist) / 120. * 0.00001;
		}
		if(dist < .5) {
			col.xyz += sin(dist * 200. - time * 0.05) * 0.005;
		}
	}

	col.xyz -= (sin(time * 0.00001 + a_pos * 0.05)) * 0.05 +
		(sin(time * 0.00001 + a_pos * 0.01)) * 0.05;

	return col;
}
