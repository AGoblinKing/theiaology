import { SpaceTime } from 'src/buffer/spacetime'
import { System } from './system'

// move left over entities to the music or rain or snow or tornado/etc

class Weather extends System {
  future: SpaceTime
  velocity: SpaceTime

  tick() {
    // rip through entities and move them to the music if not assigned
    // if at 0,0,0 then put randomly somewhere + pick color
  }
}

new Weather()
