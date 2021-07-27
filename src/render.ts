import { PerspectiveCamera, Scene, WebGLRenderer } from "three"
import { Value } from "./store"

export const scene = new Value(new Scene())
export const camera = new Value(new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000))

camera.$.position.set(0, 1.6, 0)

export const renderer = new Value(new WebGLRenderer())

renderer.$.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.$.domElement)

export const tick = new Value(0)
export const timestamp = new Value(0)
export const delta = new Value(0)

let resize = false
function Loop($t) {
    delta.is(($t - timestamp.$)/1000)
    timestamp.set($t)

    tick.is(tick.$ + 1)
    renderer.$.render(scene.$, camera.$)

    if(resize) {
        renderer.$.setSize(window.innerWidth, window.innerHeight)
        camera.$.aspect = window.innerWidth/window.innerHeight
        camera.$.updateProjectionMatrix()
        resize = false
    }
}

renderer.$.setAnimationLoop(Loop)

window.addEventListener("resize", () => {
    resize = true
})