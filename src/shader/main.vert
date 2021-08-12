	
vec4 mvPosition = vec4( transformed, 1.0 );


mvPosition = AnimationMatrix(instanceMatrix) * mvPosition;
v_pos = (modelMatrix * SpaceTime(mvPosition)).xyz;
mvPosition = modelViewMatrix * Animation(SpaceTime(mvPosition));

mvPosition = projectionMatrix * mvPosition;
gl_Position = mvPosition;