import { VRButton } from "three/examples/jsm/webxr/VRButton.js"
import { renderer } from "./render"

renderer.$.xr.enabled = true
document.body.appendChild(VRButton.createButton(renderer.$))