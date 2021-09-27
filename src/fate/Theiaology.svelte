<script lang="ts">
  // organize-imports-ignore
  import { Publish, Save } from 'src/input/save'
  import {
    mirror_shown,
    modal_default,
    modal_location,
    modal_options,
    modal_visible,
    timeline_shown,
  } from './editor'
  import Fate from './Fate.svelte'
  import Modal from './Modal.svelte'

  import Box from './Box.svelte'

  import { mouse_page } from 'src/input/mouse'
  import { dotTheia} from 'src/config'
  import { Redo, Undo } from 'src/controller/undoredo'
  import { key_down, key_map } from 'src/input/keyboard'
  import { Copy, Cut, Paste } from 'src/controller/copypaste'
  import { ReadFile } from 'src/input/file'
  import Mirror from './Mirror.svelte'
  import { first } from 'src/realm'
  import { EVar } from './weave'

  import Score from './Score.svelte'

  function Browse() {
    modal_location.set(
      modal_location.$.set($mouse_page.x - 5, $mouse_page.y - 5)
    )

    modal_options.set(['DEMOS', 'STEAM'])

    // if this is in steam offer to publish
    // @ts-ignore
    if (window.$team) {
      // @ts-ignore
      modal_options.$.push('PUBLISH', 'SAVES', 'OWNED')
    }

    modal_visible.set((res) => {
      switch (res) {
        case 'OWNED':
          window.open('/owned/', 'shop')
          // @ts-ignore
          break
        case 'PUBLISH':
          const f = first.$.fate.$
          Publish(f.text(0), ['fate'], "")
          setTimeout(() => {
            modal_location.set(
              modal_location.$.set($mouse_page.x - 5, $mouse_page.y - 5)
            )
            modal_options.set(["Uploading to Steam...", "Will open in overlay once complete."])
            modal_visible.set((res) => {
            
            })
          })
          break
        case 'SAVES':
          window.open('/saves/', 'saves')
          break
        case 'DEMOS':
          setTimeout(() => {
            modal_location.set(
              modal_location.$.set($mouse_page.x - 5, $mouse_page.y - 5)
            )
            modal_options.set(dotTheia)
            modal_visible.set((res) => {
              window.open(
                `/${res}`,
                key_map.$['Control'] ? '_overlay' : '_self'
              )
            })
          })
          break
        case 'STEAM':
          window.open(
            'https://steamcommunity.com/app/1752690/workshop/',
            '_new'
          )
          break
      }
    })
  }

  function Sponsor() {
    window.open('https://github.com/sponsors/AGoblinKing', '_new')
    return
  }

  function handleMultiplayer(res) {
    switch (res) {
      case 'Public':
        window.location.hash = `public`

        break
      case 'Secret':
        window.location.hash =
          'private/' +
          `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`.slice(0, 8)

        break

      default:
        return undefined
    }

    modal_visible.set(() => {
      modal_visible.set(false)
    })

    modal_location.set(
      modal_location.$.set($mouse_page.x - 5, $mouse_page.y - 5)
    )

    setTimeout(() => {
      window.location.reload()
    }, 10)
  }

  function Multiplayer() {
    modal_location.set(
      modal_location.$.set($mouse_page.x - 5, $mouse_page.y - 5)
    )

    modal_options.set(['Public', 'Secret'])

    modal_visible.set((res) => setTimeout(handleMultiplayer(res)))
  }

  const down = 'music-name|vox-name|root-name'

  key_down.on((c) => {
    if (!$timeline_shown) return

    switch (c.toLowerCase()) {
      case 'y':
        Redo()
        break
      case 'x':
        Cut()
        break
      case 'c':
        Copy()
        break
      case 'v':
        Paste()
        break
      case 'z':
        if (key_map.$['Control']) {
          Redo()
        } else {
          Undo()
        }
        break
    }
  })

  async function loadFile(event) {
    const reader = new FileReader()
    reader.addEventListener('load', (e: any) => {
      ReadFile(event.target.files[0], e.target.result)
    })
    try {
      reader.readAsArrayBuffer(event.target.files[0])
    } catch (ex) {}
  }
</script>

<div class="commands">
  <Box
    hover="Weave FATE"
    click={() => timeline_shown.set(!timeline_shown.$)}
    nav={{
      tag: 'theiaology',
      right: 'workspace|load',
      down: 'music|vox|root',
    }}>> FATE</Box
  >

  <Box
    tilt={-45}
    hover="Clear into a new workspace"
    click={() => {
      // @ts-ignore
      window.location = `/workspace/for/${
        Math.random() * Number.MAX_SAFE_INTEGER
      }`
    }}
    nav={{ tag: 'clear', left: 'workspace|theiaology', right: 'save', down }}
  >
    Clear
  </Box>
  <Box
    tilt={-90}
    hover="Load a Fate"
    nav={{ tag: 'load', left: 'workspace|theiaology', right: 'save', down }}
    ><input
      id="load"
      type="file"
      title="LOAD"
      accept=".theia,.mp3,.vox,.json, .fate"
      on:change={loadFile}
    />
    <label for="load">LOAD</label></Box
  >
  <Box
    tilt={-180}
    hover="Download Fate files.  Drag + Drop or load!"
    nav={{ tag: 'save', right: '.fate', left: 'load', down }}
    click={Save}>SAVE</Box
  >
  <Box
    tilt={290}
    hover="Find FATEs to play!"
    style="border-radius: 0 0 0.5rem 0;"
    nav={{ tag: '.fate', left: 'save', right: 'sponsor', down }}
    click={Browse}>YGGDRASIL</Box
  >

  <!-- <Box
    tilt={180}
    hover="Host or Join Multiplayer Realms"
    nav={{ tag: 'net', left: 'sponsor', down }}
    click={Multiplayer}
    style="border-radius: 0 0 0.5rem 0;"
  >
    MULTIPLAYER
  </Box> -->
</div>
<Modal />
{#if $timeline_shown}
  <theiaology>
    <Fate />
  </theiaology>

  {#if $mirror_shown}
    <Mirror />
  {/if}
{/if}

<Score />

<style>
  .commands {
    position: absolute;
    pointer-events: all;
    display: flex;
  }

  theiaology {
    display: flex;
    flex-direction: column;
    pointer-events: none;
    top: 1.75rem;
    left: 0;

    height: calc(100% - 1.75rem);
    position: absolute;
    z-index: 1000;
  }

  label {
    cursor: url('/sprite/pointer.png') 0 0, pointer;
  }
</style>
