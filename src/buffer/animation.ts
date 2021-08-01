import { AtomicBuffer } from 'src/atomic'
import { COUNT } from 'src/config'

export enum EAnimation {
  Normal = 0,
  NoEffects,
  Fire,
}
export const animation = new AtomicBuffer(
  new Int32Array(new SharedArrayBuffer(COUNT * 4))
)
