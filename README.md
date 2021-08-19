# Theia.Games

[![Itch](https://github.com/AGoblinKing/theia.games/actions/workflows/itch.yml/badge.svg)](https://corporate-entity.itch.io/theiagames)
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
- [x] .theia file format for sharing the whole thing as drag n' drop or linkable
- [?] a Timeline editor in VR with funky text

![Promotional Gif](./public/image/interaction.gif)

## Quicker Start

Use GitHub CodeSpaces and slam that F5. You can make the URL public, it defaults to only you.

## Quick Start

Install https://nodejs.org/en/download/ or have >v14

```
npm ci
npm run dev
http://localhost:10001
```

or https://theia.games

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

## Guide

- [ ] Drag n' drop your own music
- [ ] Make walking peace signs to walk
- [ ] Point only your pinky to turn a direction
- [ ] Drag n' drop your own [vox](https://ephtracy.github.io/) files

## Maybe One Day

- [ ] Spells like uh fireballs and lightning raining from the sky
- [~] Physics on a worker making use of those magic buffers
- [~] ~~WebRTC~~ Networking
- [ ] Play Queue / Gateways / Playlists / Albums?
- [ ] Motion: Climbing, ride the tiger, zip line, swing
- [ ] Interaction: Buttons, triggers, branching?
