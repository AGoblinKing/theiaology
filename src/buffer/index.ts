import { ITimeline } from 'src/timeline/def-timeline'
import { Value } from 'src/value/value'
import { Animation } from './animation'
import { Impact } from './impact'
import { Matter } from './matter'
import { Size } from './size'
import { SpaceTime } from './spacetime'
import { Status } from './status'
import { Timeline } from './timeline'
import { Universal } from './universal'
import { Velocity } from './velocity'

export const velocity = new Velocity()
export const past = new SpaceTime()

// the present is somewhere between
export const future = new SpaceTime()
export const animation = new Animation()
export const matter = new Matter()

export const impact = new Impact()
export const size = new Size()
export const status = new Status()
export const universal = new Universal()

// Used to alert when timeline changes and to notify the cardinal
export const timeline = new Value(new Timeline())

class TimelineJSONValue extends Value<ITimeline> {
  constructor(json: ITimeline) {
    super(json)

    timeline.on(() => {
      this.set(timeline.$.toObject())
    })
  }
}

export const timeline_json = new TimelineJSONValue({
  markers: {},
  _: {},
  flat: {},
})
