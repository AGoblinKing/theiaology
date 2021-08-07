import { timeline } from 'src/buffer'
import { Timeline } from 'src/buffer/timeline'

// Load .theia file into the timeline
export const TIME_START = 4 * 4
export function Load(bytes: ArrayBuffer) {
  const view = new DataView(bytes)
  const timeLength = view.getInt32(TIME_START)

  timeline.$.freeAll()

  for (let i = 0; i < timeLength - 1; i++) {
    const val = view.getInt32(TIME_START * 2 + i * 4)
    timeline.$.store(i, val)

    // if
    if (i % Timeline.COUNT === 1 && val !== 0) {
      timeline.$.available.splice(
        timeline.$.available.indexOf(Math.floor(i / Timeline.COUNT)),
        1
      )
    }
  }

  timeline.poke()
}
