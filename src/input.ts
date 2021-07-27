import { renderer } from "./render"
import { Value } from "./store"

const $c = renderer.$.domElement

export const mouse_left = new Value(false)
export const mouse_right = new Value(false)

$c.addEventListener("mousedown", (e) => {

    switch (e.button) {
        case 0:
          mouse_left.is(true)
          break
   
        case 2:
          mouse_right.is(true)
    
          break
      }
 
})

$c.addEventListener("mouseup", (e) => {

    switch (e.button) {
        case 0:
          mouse_left.is(false)
          break
   
        case 2:
          mouse_right.is(false)
    
          break
      }

})

window.addEventListener(
    'contextmenu',
    function (evt) {
      evt.preventDefault()
    },
    false
  )