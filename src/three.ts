import * as fs from 'file-saver'
import * as idb from 'idb-keyval'
import * as THREE from 'three'

window.THREE = THREE
window['IDB'] = idb
window['FS'] = fs
