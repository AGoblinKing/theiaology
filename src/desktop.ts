import { Vector3 } from 'three'
import { Value } from './store'

export const mouse = new Value([0, 0])

export const mouse_world = new Value(new Vector3())
