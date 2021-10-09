// notify on either center left or right hand

import { first } from 'src/realm'
import { EMessage, ENotifyPosition } from 'src/system/enum'

// TODO: hold this thought, maybe we just ask cardinal to do it, since it already renders text
// lets try out the carry/carried system since this is basically that

// Notify using rez'd cubes that'll auto release
export function Notify(
  msg: string,
  loc: ENotifyPosition = ENotifyPosition.CENTER_BOTTOM
) {
  // just send cardinal a message asking them to do it
  first.$.cardinal.send({
    message: EMessage.FAE_NOTIFY,
    loc,
    data: msg,
  })
}
