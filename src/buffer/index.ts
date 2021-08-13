import { ITimeline } from 'src/timeline/def-timeline'
import { Value } from 'src/util/value'
import { Animation } from './animation'
import { Impact } from './impact'
import { Matter } from './matter'
import { Size } from './size'
import { SpaceTime } from './spacetime'
import { Status } from './status'
import { Timeline } from './timeline'
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

// Used to alert when timeline changes and to notify the cardinal
export const timeline = new Value(new Timeline())

export const timeline_json = new Value<ITimeline>({
  markers: {},
  _: {},
  flat: {},
})

timeline.on(() => {
  timeline_json.set(timeline.$.toObject())
})
