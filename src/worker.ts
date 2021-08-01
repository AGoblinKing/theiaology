// handle postMessage and update the sharedarraybuff
import { Loop } from './time'

self.onmessage = function mainMessage(msg) {
  const arr = new Int32Array(msg.data)
}

// pumps time on a slower tick
setInterval(Loop, 100)
