import { animation } from 'src/buffer'
import { EAnimation } from 'src/buffer/animation'
import { hands } from 'src/input/xr'
import { ECardinalMessage } from 'src/system/message'
import { SystemWorker } from 'src/system/sys'
import { timestamp } from 'src/uniform/time'
import { vr_keys } from 'src/xr/joints'

let hand_joints: number[] = []

// Rezes allow us to inject into the worker simulation from the main thread
export function RezHands(cardinal: SystemWorker) {
  hand_joints = []
  // request the hands
  // vr_keys is an enum and therefore 2x the length, which is what we want
  // for two hands anyhow
  for (let i = 0; i < Object.keys(vr_keys).length; i++) {
    cardinal.send(ECardinalMessage.RequestID)
    cardinal.queue((id) => {
      hand_joints.push(id)

      animation.store(id, EAnimation.NoEffects)
    })
  }
}

// update hand rezes if they exist
timestamp.on(() => {
  // no hands, nothing to do
  if (hands.$.length === 0) return

  for (let i = 0; i < hand_joints.length; i++) {
    const ix = i % 25
    const id = hand_joints[i]
  }
})
