<script lang="ts">
  // organize-imports-ignore

  import { timeline_shown } from './editor'
  import Timeline from './Timeline.svelte'
  import Modal from './Modal.svelte'

  import { Save } from 'src/file/save'

  import Box from './Box.svelte'
  import { ReadFile } from 'src/file/file'

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
  href="https://github.com/agoblinking/Theia.games"
  target="_new">GITHUB</a
>

<div class="commands">
  <Box
    hover="Toggle the Theiaology Editor"
    click={() => timeline_shown.set(!timeline_shown.$)}
    nav={{
      tag: 'theiaology',

      right: 'load',
      left: 'save',
      down: 'root',
    }}>> THEIAOLOGY</Box
  >
  <Box
    hover="Load files into theia "
    nav={{ tag: 'load', left: 'theiaology', right: 'save', down: 'root' }}
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
    hover="Download .theia file.  Drag + Drop or load!"
    nav={{ tag: 'save', right: 'theiaology', left: 'load', down: 'root' }}
    click={Save}>SAVE</Box
  >
</div>
{#if $timeline_shown}
  <Modal />
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
  label {
    cursor: pointer;
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
</style>
