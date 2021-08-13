<script lang="ts">
  import { audio, audio_buffer, audio_name } from 'src/sound/audio'

  import Box from './Box.svelte'

  // organize-imports-ignore
  import Node from './Node.svelte'
  import fs from 'file-saver'
  import { voxes } from 'src/buffer/vox'
</script>

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
