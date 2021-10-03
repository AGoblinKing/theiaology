import {
  left_grab,
  left_use,
  right_grab,
  right_use,
} from 'src/controller/controls'
import { IJointGroup, vr_keys } from 'src/input/joints'
import { renderer } from 'src/render'
import { tick } from 'src/shader/time'
import { Value } from 'src/value'
import { Group, Object3D, Vector3 } from 'three'
import { mouse_left, mouse_pos, mouse_right } from './mouse'

export const left = [
  0.18681570887565613, 1.382739543914795, -0.18258269131183624,
  0.16145765781402588, 1.4247382879257202, -0.19330185651779175,
  0.14029449224472046, 1.4471595287322998, -0.203621506690979,
  0.11854463070631027, 1.465911626815796, -0.2214338481426239,
  0.10323526710271835, 1.4838736057281494, -0.22844798862934113,
  0.17240598797798157, 1.4193986654281616, -0.20432732999324799,
  0.16084901988506317, 1.4546279907226562, -0.24567970633506775,
  0.14093229174613953, 1.4714457988739014, -0.27322903275489807,
  0.11823146790266037, 1.47991144657135, -0.27514559030532837,
  0.09668971598148346, 1.4859790802001953, -0.2757745385169983,
  0.16766689717769623, 1.4088687896728516, -0.20943443477153778,
  0.15686826407909393, 1.4355288743972778, -0.2565702795982361,
  0.1320498138666153, 1.4512417316436768, -0.2878733277320862,
  0.10626484453678131, 1.4606534242630005, -0.29022565484046936,
  0.08283071964979172, 1.4681520462036133, -0.2858382761478424,
  0.16418185830116272, 1.39774751663208, -0.2118483930826187,
  0.14816531538963318, 1.4166510105133057, -0.2572179138660431,
  0.1123814508318901, 1.4268888235092163, -0.2688540816307068,
  0.08852753043174744, 1.4348570108413696, -0.26027241349220276,
  0.07257404923439026, 1.4425143003463745, -0.2435014396905899,
  0.15973716974258423, 1.383512258529663, -0.21490654349327087,
  0.13842615485191345, 1.3976171016693115, -0.2527333199977875,
  0.11209113895893097, 1.4084179401397705, -0.2411767989397049,
  0.10026412457227707, 1.416111707687378, -0.2265658974647522,
  0.09213629364967346, 1.427158236503601, -0.2094181627035141,
]

export const right = [
  -0.20063939690589905, 1.4035980701446533, -0.146737739443779,
  -0.17396438121795654, 1.4444682598114014, -0.1582299917936325,
  -0.14858832955360413, 1.4629813432693481, -0.16662096977233887,
  -0.12367366254329681, 1.4805759191513062, -0.1811697781085968,
  -0.10531037300825119, 1.496011734008789, -0.18671375513076782,
  -0.1867467612028122, 1.4405176639556885, -0.16837789118289948,
  -0.17614777386188507, 1.4762307405471802, -0.20957161486148834,
  -0.16556094586849213, 1.496448040008545, -0.23986446857452393,
  -0.14330923557281494, 1.5062041282653809, -0.2404555231332779,
  -0.1224694475531578, 1.5141875743865967, -0.24225161969661713,
  -0.18211762607097626, 1.430051326751709, -0.1737116575241089,
  -0.17240199446678162, 1.4572616815567017, -0.22076866030693054,
  -0.14676563441753387, 1.4754499197006226, -0.2500038146972656,
  -0.1224643811583519, 1.486384391784668, -0.2569943368434906,
  -0.0991157591342926, 1.4952983856201172, -0.25685617327690125,
  -0.17868107557296753, 1.4189616441726685, -0.17633163928985596,
  -0.16370420157909393, 1.4384002685546875, -0.22183001041412354,
  -0.13368573784828186, 1.4506241083145142, -0.2435133308172226,
  -0.10905411839485168, 1.4599230289459229, -0.23991341888904572,
  -0.09051994234323502, 1.4681507349014282, -0.22637824714183807,
  -0.17429772019386292, 1.4047664403915405, -0.17965318262577057,
  -0.15385453402996063, 1.419324517250061, -0.21778598427772522,
  -0.12518753111362457, 1.4303231239318848, -0.21877425909042358,
  -0.1070295199751854, 1.437195897102356, -0.21280734241008759,
  -0.08862950652837753, 1.4469671249389648, -0.20587250590324402,
]

const $vec3 = new Vector3()

export const left_controller = new Value<Object3D>().re(console.log)
export const right_controller = new Value<Object3D>().re(console.log)

export class Phony extends Group implements IJointGroup {
  handedness: 'left' | 'right' = 'left'
  handData: number[]

  joints: { [key: string]: Group }
  lastLeft = new Vector3()
  lastRight = new Vector3()

  controllerOffset = new Vector3()

  constructor(handData: number[], handedness: 'left' | 'right' = 'left') {
    super()
    this.handData = handData
    this.handedness = handedness

    this.joints = {}

    for (let i = 0; i < handData.length / 3; i++) {
      const hand = new Group()
      this.joints[vr_keys[i]] = hand
      this.add(hand)
    }

    tick.on(this.tick.bind(this))
    // reset controller after XR done
    renderer.xr.addEventListener('sessionend', () => {
      this.controllerOffset.set(0, 0, 0)
    })
  }

  tick(t) {
    // determine controller position
    let controller
    switch (this.handedness) {
      case 'left':
        if (!left_controller.$) break
        this.controllerOffset.copy(left_controller.$.position)
        controller = left_controller.$
        break
      case 'right':
        if (!right_controller.$) break
        this.controllerOffset.copy(right_controller.$.position)
        controller = right_controller.$
        break
    }

    for (let i = 0; i < this.handData.length / 3; i++) {
      const hand = this.joints[vr_keys[i]]
      const forward =
        this.handedness !== 'left'
          ? mouse_left.$
            ? -1
            : 0
          : mouse_right.$
          ? -1
          : 0

      hand.position.set(
        this.handData[i * 3],
        this.handData[i * 3 + 1] - 1.6,
        this.handData[i * 3 + 2]
      )

      switch (true) {
        case this.handedness === 'left' && right_use.$:
          if (
            vr_keys[i].indexOf('thumb') !== -1 ||
            vr_keys[i].indexOf('index') !== -1
          )
            hand.position.x *= 0.9
          break
        case this.handedness === 'right' && left_use.$:
          if (
            vr_keys[i].indexOf('thumb') !== -1 ||
            vr_keys[i].indexOf('index') !== -1
          )
            hand.position.x *= 0.9
          break
        case this.handedness === 'right' && left_grab.$:
          hand.position.multiplyScalar(0.6)
          break
        case this.handedness === 'left' && right_grab.$:
          hand.position.multiplyScalar(0.6)
          break
      }

      // controller is moving
      if (this.controllerOffset.length() > 0) {
        hand.position
          .applyQuaternion(controller.quaternion)
          .add(this.controllerOffset)
        continue
      }

      // move hand left or right
      hand.position.x +=
        (this.handedness === 'left' ? 0.1 : -0.1) +
        Math.cos(t * 0.01) * 0.01 * (this.handedness === 'left' ? 1 : -1)

      hand.position.y += Math.sin(t * 0.01) * 0.01
      hand.position.z += -0.15

      let effect = 0.01

      switch (true) {
        case this.handedness === 'left' && mouse_pos.$.x > 0.25:
          effect = 0.075

          break
        case this.handedness !== 'left' && mouse_pos.$.x < -0.25:
          effect = 0.075
          break

        case this.handedness === 'left' && mouse_pos.$.x > -0.75:
          effect = 0.055

          break
        case this.handedness !== 'left' && mouse_pos.$.x < 0.75:
          effect = 0.055
          break
      }

      $vec3
        .set(mouse_pos.$.x, mouse_pos.$.y, forward * 2)
        .multiplyScalar(effect * 2)

      const target = this.handedness === 'left' ? this.lastLeft : this.lastRight
      target.multiplyScalar(4).add($vec3).divideScalar(5)

      hand.position.add(target)
      // lerp towards mouse a little
    }
  }
}
