import { ATOM_COUNT } from 'src/config'
import { System } from './system'
class AI extends System {
  constructor() {
    super(500)
  }

  tick() {
    for (let i = 0; i < ATOM_COUNT; i++) {}
  }
}

new AI()
