<script lang="ts">
  import { audio, audio_buffer, audio_name } from 'src/sound/audio'

  import Box from './Box.svelte'

  // organize-imports-ignore
  import Node from './Node.svelte'
  import fs from 'file-saver'

  import { fantasy, first } from 'src/realm/realm'


  $: timeline = $fantasy.timeline
  $: voxes = $first.voxes



</script>

<div class="timeline">
  <div class="nodes">

    {#if $audio_buffer}
      <div class="vox">
        <Box
          tilt={180}
          hover="Remove Music"
          style="border-radius: 0.5rem 0 0 0.5rem;"
          nav={{
            tag: 'music-del',
            up: 'theiaology',
            down: 'vox-del|root',
            right: 'music',
          }}
          click={() => {
            audio_buffer.set(undefined)
            audio.src = ''
            audio.load()
          }}>-</Box
        >
        <Box
          tilt={180}
          nav={{
            tag: 'music',
            up: 'theiaology',
            down: 'vox|root',
            left: 'music-del',
            right: 'music-name',
          }}
          hover="Download Audio File"
          click={() => {
            fs.saveAs(
              new Blob([audio_buffer.$], { type: 'audio/mp3' }),
              audio_name.$
            )
            // download audio file
          }}>MUSIC</Box
        >
        <Box
          tilt={180}
          style="border-radius: 0 0.5rem 0 0"
          hover="Audio File"
          flex
          nav={{
            tag: 'music-name',
            left: 'music',
            up: 'workspace',
            down: 'vox-name|root-name',
          }}>{$audio_name}</Box
        >
      </div>
    {/if}
    {#each Object.keys($voxes) as key, i}
      <div class="vox">
        <Box
          nav={{
            tag: `${i === 0 ? 'vox-del' : ''}|vox-del-${i}|vox-del-last`,
            right: `vox-${i}`,
            up: `vox-del-${i - 1}|music-del|theiaology`,
            down: `vox-del-${i + 1}|root`,
          }}
          style="border-radius: 0.5rem 0 0 0.5rem;"
          tilt={-90}
          hover="Remove VOX"
          click={() => {
            delete $voxes[key]
            voxes.poke()
          }}>-</Box
        >
        <Box
          tilt={-90}
          nav={{
            tag: `${i === 0 ? 'vox' : ''}|vox-${i}|voxlast`,
            up: `vox-${i - 1}|music|theiaology`,
            left: `vox-del-${i}`,
            down: `vox-${i + 1}|root`,
            right: `vox-name-${i}`,
          }}
          click={() => {
            // download vox file
            fs.saveAs(
              new Blob([$voxes[key].view], { type: 'vox' }),
              `${key}.vox`
            )
          }}
         
          hover="Download VOX Model File">VOX</Box
        >
        <Box
          tilt={-90}
          flex 
          hover="Name of the VOX"
          nav={{
            tag: `vox-name-${i}|${i === 0 ? 'vox-name' : ''}`,
            up: `vox-name-${i - 1}|music-name|workspace`,
            down: `vox-name-${i + 1}|root-name`,
            left: `vox-${i}`,
          }}>{key}</Box
        >
      </div>
    {/each}

    <Node i={$timeline ? 0 : 0}/>
  </div>
</div>

<style>
  .vox {
    display: flex;
    justify-content: center;
    margin-right: 1.5rem;
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
    background-color: rgb(72, 2, 75, 0.9);
  }

  .timeline::-webkit-scrollbar-thumb {
    background: rgba(153, 4, 158, 0.9);
   ;
    border-radius: 1rem;
    max-height: 5rem;
  }

</style>
