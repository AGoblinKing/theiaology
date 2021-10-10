vec4 mvPosition = vec4(transformed, 1.0);

mvPosition = AnimationMatrix(instanceMatrix) * mvPosition;
a_pos = (modelMatrix * SpaceTime(mvPosition)).xyz;
v_pos = (modelMatrix * mvPosition).xyz;

mvPosition = modelViewMatrix * Animation(SpaceTime(mvPosition));

mvPosition = projectionMatrix * mvPosition;
gl_Position = mvPosition;