# Theia.Games

[![Itch](https://github.com/AGoblinKing/theia.games/actions/workflows/itch.yml/badge.svg)](https://github.com/AGoblinKing/theia.games/actions/workflows/itch.yml)
| [Discord](https://discord.gg/bPq8U3zhvy)

_Undock your imagination._

## Guide

- [ ] Drag n' drop your own music
- [ ] Make walking peace signs to walk
- [ ] Point only your pinky to turn a direction
- [ ] Drag n' drop your own [vox](https://ephtracy.github.io/) files

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

## Docs

Maybe one day.

## How soon is now?

- [ ] Spells like uh fireballs and lightning raining from the sky
- [ ] a Timeline editor in VR with funky text
- [ ] Physics on a worker making use of those magic buffers
- [ ] .theia file format for sharing the whole thing as drag n' drop or linkable
- [ ] WebRTC Networking
- [ ] Play Queue / Gateways / Playlists / Albums?
- [ ] Motion: Climbing, ride the tiger, zip line, swing
- [ ] Interaction: Buttons, triggers, branching?
