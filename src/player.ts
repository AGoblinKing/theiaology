import { doRez } from 'src/rez/rez'
import { Value } from 'src/store'
import { Object3D } from 'three'
import './controls/fps'

export class Player extends Object3D {
  y = 1.6
}

export const player = new Value(new Player())

doRez.on(() => {
  // sync player to cam
})
