# `THEIAOLOGY`

[Steam](https://steam.theiaology.com)
| [Discord](https://discord.gg/bPq8U3zhvy)

_Undock your imagination._

![Promotional Gif](./public/image/promo.gif)

## Features

- [x] Oculus Quest Browser used as reference VR device.
- [x] Funky Voxel Cubes
- [x] ArrayBuffer driven Rez System
- [x] Only One Material
- [x] VR Hand Locomotion and Gestures (quest browser is the ref)
- [x] WebXR
- [x] Audio Responsive
- [x] Drag n' Drop .vox / .m3p / .wav / .ogg files to use them
- [x] Unified Velocity locomotion
- [x] Pet DogSheeps in VR
- [x] SharedArrayBuffer Workers, like uh.. an ECS that your GPU has access to
- [x] .fate file format for sharing the whole thing as drag n' drop or linkable
- [x] a Timeline editor in VR with funky text
- [x] Steam Workshop Integration (Sell your `.fate` files!)
- [x] MIDI Programmable Noise Generator for the Bleeps and Bloops
- [x] No culling 256x256 voxels per realm with 10 realms running smooth via OverWorlding on one midsec desktop
- [x] Again, everything is simulated regardless of your position in the world (life goes on with you)
- [x] Runs smooth on Oculus Quest Browser in VR
- [?] Secrets yet untold.

![Promotional Gif](./public/image/interaction.gif)

## Contributing Guidelines

I won't accept any PRs directly but I will read them and try to understand the reason for the PR. This is the quickest way to get me to fix bugs or add features.

Why this way?

I do not want to bother with code style, guidelines or worry about breaking other coder's flows really. #solodev

It also means you don't have to test your code before sending me that PR just try to get the idea across.

## Quickest Start

https://theiaology.com/sandbox?dev

Share your .fate files in a public GitHub repository called theiaology.com and you can load .fate files from it.

ie: https://theiaology.com/username/a_city would resolve to github.com/username/theiaology.com/blob/main/a_city.fate

## Quick Start

Install https://nodejs.org/en/download/ or have >v14

```
npm ci
npm run dev
http://localhost:10001
```

![Voxel Text](./public/image/ANYTHING.gif)

## But I want to host it

```
npm ci
npm run build
```

The public directory should be your webroot.

You will need these headers.

```
"Cross-Origin-Opener-Policy": "same-origin",
"Cross-Origin-Embedder-Policy": "require-corp"
```

Which are brutal but enable SharedArrayBuffers which are magic.

![Promotional VR GIF](./public/image/vr.gif)
