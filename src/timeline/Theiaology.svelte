<script lang="ts">
  // organize-imports-ignore
  import { Save } from 'src/input/save'
  import {
    modal_location,
    modal_options,
    modal_visible,
    timeline_shown,
  } from './editor'
  import Timeline from './Timeline.svelte'
  import Modal from './Modal.svelte'

  import Box from './Box.svelte'

  import { mouse_page } from 'src/input/mouse'
  import { dotTheia } from 'src/config'
  import { Redo, Undo } from 'src/controller/undoredo'
  import { key_down, key_map } from 'src/input/keyboard'
  import { Copy, Cut, Paste } from 'src/controller/copypaste'
  import { ReadFile } from 'src/input/file'

  function Browse() {
    modal_location.set(
      modal_location.$.set($mouse_page.x - 5, $mouse_page.y - 5)
    )

    modal_options.set(dotTheia)

    modal_visible.set((res) => {
      window.open(`/${res}`, '_self')
      modal_visible.set(false)
    })
  }

  function Sponsor() {
    window.open('https://github.com/sponsors/AGoblinKing', '_new')
    return
  }

  function handleMultiplayer(res) {
    switch (res) {
      case 'Host':
        window.location.search = `public|${`${Math.floor(
          Math.random() * Number.MAX_SAFE_INTEGER
        )}`.slice(0, 8)}`

        break
      case 'Secret':
        window.location.search = 'secret|' + `${Math.floor(
          Math.random() * Number.MAX_SAFE_INTEGER
        )}`.slice(0, 8)

        break
      case 'Public':
        window.location.search = `public`

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

<a
  class="ribbon github"
  href="https://github.com/agoblinking/theiaology"
  target="_new">GITHUB</a
>

<div class="commands">
  <Box
    hover="Toggle the Theiaology Editor"
    click={() => timeline_shown.set(!timeline_shown.$)}
    nav={{
      tag: 'theiaology',
      right: 'workspace|load',
      down: 'music|vox|root',
    }}>> THEIAOLOGY</Box
  >
  <Box
    tilt={-90}
    hover="Load files into Theiaology "
    nav={{ tag: 'load', left: 'workspace|theiaology', right: 'save', down }}
    ><input
      id="load"
      type="file"
      title="LOAD"
      accept=".theia,.mp3,.vox,.json"
      on:change={loadFile}
    />
    <label for="load">LOAD</label></Box
  >
  <Box
    tilt={-180}
    hover="Download Theiaologian files.  Drag + Drop or load!"
    nav={{ tag: 'save', right: '.theia', left: 'load', down }}
    click={Save}>SAVE</Box
  >
  <Box
    tilt={290}
    hover="Play theiaologian demos"
    nav={{ tag: '.theia', left: 'save', right: 'sponsor', down }}
    click={Browse}>DEMOS</Box
  >
  <Box
    tilt={110}
    hover="A Goblin King Demands Tribute"
    nav={{ tag: 'sponsor', left: '.theia', right: 'net', down }}
    click={Sponsor}
    style="border-radius: 0 0 0.5rem 0;"
  >
    SPONSOR
  </Box>
  <!-- <Box
    tilt={180}
    hover="Host or Join Multiplayer Realms"
    nav={{ tag: 'net', left: 'sponsor', down }}
    click={Multiplayer}
    style="border-radius: 0 0 0.5rem 0;"
  >
    MULTIPLAYER
  </Box>  -->
</div>
<Modal />
{#if $timeline_shown}
  <theiaology>
    <Timeline />
  </theiaology>
{/if}

<style>
  .commands {
    position: absolute;
    pointer-events: all;
    display: flex;
  }

  .ribbon {
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    position: absolute;
    z-index: 1;
    padding: 0.5rem 5rem;
    color: white;
    text-decoration: none;
    text-align: center;
    transform: rotate(45deg);
    text-shadow: rgb(0, 0, 0) 0.075rem 0.075rem 0rem;
  }

  .ribbon:hover {
    background-color: rgb(7, 136, 179);
  }

  .github {
    top: 1rem;
    text-shadow: rgb(0, 0, 0) 0.075rem 0.075rem 0rem;
    pointer-events: all;
    right: -5.5rem;
    font-size: 0.75rem;
    border: 0.25rem solid white;

    padding: 0.25rem 5rem;
    background-color: darkslategray;
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
    cursor: pointer;
  }
</style>
