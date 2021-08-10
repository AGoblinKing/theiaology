<script lang="ts">
  import { audio, audio_buffer, audio_name } from 'src/audio'
  import { ReadFile } from 'src/file'

  import { Save } from 'src/file/save'
  import { voxes } from 'src/buffer/vox'
  import Box from './Box.svelte'

  // organize-imports-ignore
  import Node from './Node.svelte'
  import fs from 'file-saver'
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
    hover="Editor for .Theia Files"
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
      accept=".theia,.mp3,.vox"
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
<div class="timeline">
  <div class="nodes">
    {#if $audio_buffer}
      <div class="vox">
        <Box
          tilt={180}
          hover="Remove Music"
          click={() => {
            audio_buffer.set(undefined)
            audio.src = ''
            audio.load()
          }}>x</Box
        >
        <Box
          tilt={180}
          hover="Download Audio File"
          click={() => {
            fs.saveAs(
              new Blob([audio_buffer.$], { type: 'audio/mp3' }),
              audio_name.$
            )
            // download audio file
          }}>MUSIC</Box
        >
        <Box tilt={180} hover="Audio File">{$audio_name}</Box>
      </div>
    {/if}
    {#each Object.keys($voxes) as key}
      <div class="vox">
        <Box
          tilt={-90}
          hover="Remove VOX"
          click={() => {
            delete $voxes[key]
            voxes.poke()
          }}>x</Box
        >
        <Box
          tilt={-90}
          click={() => {
            // download vox file

            fs.saveAs(
              new Blob([$voxes[key].view], { type: 'vox' }),
              `${key}.vox`
            )
          }}
          hover="Download VOX Model File">VOX</Box
        >
        <Box tilt={-90} hover="Name of the VOX">{key}</Box>
      </div>
    {/each}

    <Node />
  </div>
</div>

<style>
  .commands {
    pointer-events: all;
    display: flex;
  }
  label {
    cursor: pointer;
  }

  .vox {
    display: flex;
  }

  .nodes {
    direction: ltr;
  }
  .timeline {
    transition: all ease-in-out 0.25s;
    display: flex;
    flex-direction: column;

    flex: 1;
    overflow-y: scroll;
    pointer-events: all;
    direction: rtl;
    text-shadow: rgb(0, 0, 0) 0.075rem 0.075rem 0rem;
    scroll-behavior: smooth;
  }

  .timeline::-webkit-scrollbar {
    width: 1rem;
    background-color: rgba(2, 91, 255, 0.288);
  }

  .timeline::-webkit-scrollbar-thumb {
    background: rgba(0, 28, 189, 0.842);
    outline: 1px solid slategrey;
    max-height: 5rem;
  }
</style>
