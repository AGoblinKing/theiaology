	
vec4 mvPosition = vec4( transformed, 1.0 );

v_pos = (modelMatrix * (instanceMatrix * mvPosition)).xyz;

mvPosition = AnimationMatrix(InterpolateMatrix(instanceMatrix)) * mvPosition;
mvPosition = modelViewMatrix * Animation(mvPosition);

mvPosition = projectionMatrix * mvPosition;
gl_Position = mvPosition;