// handle matter color
varying vec3 v_matter;

vec4 MatterFrag(in vec4 col) {

  col.x = v_matter.x;
  col.y = v_matter.y;
  col.z = v_matter.z;

  return col;
}