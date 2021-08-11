	
vec4 mvPosition = vec4( transformed, 1.0 );

v_pos = (modelMatrix * (instanceMatrix * mvPosition)).xyz;

mvPosition = AnimationMatrix(instanceMatrix) * mvPosition;
mvPosition = modelViewMatrix * Animation(SpaceTime(mvPosition));

mvPosition = projectionMatrix * mvPosition;
gl_Position = mvPosition;