// the vox cache of assets available

import { MagickaVoxel } from 'src/render/magica'
import { Value } from 'src/value/value'

// RUNTIME: name to idx number, populated by the theia file
export const voxes = new Value<{ [name: string]: MagickaVoxel }>({})
