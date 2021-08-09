// the vox cache of assets available

import { MagickaVoxel } from './magica'
import { Value } from './value'

// name to idx number, populated by the theia file
export const voxes = new Value<{ [name: string]: MagickaVoxel }>({})
