import { timeline } from 'src/buffer'
import { key_down, key_map } from 'src/input/keyboard'
import { timeline_shown } from 'src/timeline/editor'

const past = []
const future = []

let isUndo = false
timeline.on(($t) => {
  past.push($t.toArray())
  if (past.length > 5) {
    past.shift()
  }
})

export function Undo() {
  let p = past.pop()

  if (!p) return
  p = past.pop()
  if (!p) return
  isUndo = true
  future.push(timeline.$.toArray())
  timeline.$.fromArray(p)
  timeline.poke()
  isUndo = false
}

export function Redo() {
  const p = future.pop()

  if (!p) return

  timeline.$.fromArray(p)
  timeline.poke()
}

key_down.on(($k) => {
  if (!timeline_shown.$) return

  switch ($k) {
    case 'z':
      if (key_map.$['Control']) {
        Redo()
      } else {
        Undo()
      }
      break
  }
})
