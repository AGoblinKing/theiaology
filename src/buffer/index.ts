import { Value } from 'src/valuechannel'
import { Animation } from './animation'
import { Impact } from './impact'
import { Matter } from './matter'
import { Scale } from './scale'
import { SpaceTime } from './spacetime'
import { Status } from './status'
import { ITimeline, Timeline } from './timeline'
import { Velocity } from './velocity'

export const velocity = new Velocity()
export const past = new SpaceTime()

// the present is somewhere between
export const future = new SpaceTime()
export const animation = new Animation()
export const matter = new Matter()

export const impact = new Impact()
export const scale = new Scale()
export const status = new Status()

// Used to alert when timeline changes and to notify the cardinal
export const timeline = new Value(new Timeline())

export const timeline_json = new Value<ITimeline>({
  markers: {},
  children: {},
  flat: {},
})

timeline.on(() => {
  timeline_json.set(timeline.$.toObject())
})
