// the vox cache of assets available

import { MagickaVoxel } from 'src/render/magica/magica'
import { Value } from 'src/util/value'

// RUNTIME: name to idx number, populated by the theia file
export const voxes = new Value<{ [name: string]: MagickaVoxel }>({})
