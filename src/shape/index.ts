export enum EShape {
  Singularity = 0,
  Circle,
  Line,
  Plane,
  Box,
  Text, // points to marker
  Vox,
}

export const Shapes = {
  [EShape.Singularity]: [],
}
