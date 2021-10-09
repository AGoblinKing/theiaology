<script lang="ts">
  import String from './evar/String.svelte'
  import { mouse_left } from 'src/input/mouse'

  // organize-imports-ignore
  import { modal_options, modal_location, modal_visible } from './editor'
  import Number from './evar/Number.svelte'
  import Normal from './evar/Normal.svelte'
  import Time from './evar/Time.svelte'

  import { key_down } from 'src/input/keyboard'
  import { EVar } from './weave'
  import Box from 'src/fate/Box.svelte'
  import { hashcode } from './color'
  import { FAE_SCALE } from 'src/config';
import Noise from './evar/Noise.svelte';

  // modal is a singleton so Aok, but weird
  mouse_left.on(() => {
    modal_visible.set(false)
  })

  key_down.on((k) => {
    switch (k) {
      case 'Escape':
        modal_visible.set(false)
        break
    }
  })

  $: len = Array.isArray($modal_options) ? $modal_options.length : 1

  function Group(enums: string[]) {
    const groups:{[key: string]:string[] } = {}
    for(let e of enums) {
      if(e.indexOf('_') === -1) {
        groups[e] = [e] 
        continue
      }

      const [group] = e.split('_')

      if(!groups[group]) groups[group] = []
      groups[group].push(e)
    }

    return Object.values(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }
</script>

{#if $modal_visible}
  <div
    class="modal"
    style="left: {$modal_location.x}px; top: {$modal_location.y >
    window.innerHeight / 2
      ? $modal_location.y - (len / 5) * 60
      : $modal_location.y}px"
  >
    {#if typeof $modal_options === 'string'}
      <Box span tilt={-60}>
        {$modal_options}
      </Box>
    {:else if Array.isArray($modal_options)}
      {#each Group($modal_options) as contentRow}
      <div class="contentRow"> 
          {#each contentRow as content}
           
            <Box tilt={hashcode(content.slice(0, 3)) * 0.05 % 360} style="flex:1;" click={() => {
              if (typeof $modal_visible === 'function') $modal_visible(content)
              modal_visible.set(false)
            }}>
                <div
                  class="item"
                >
                  {content}
                </div>
              </Box>
          
            {/each}
          </div>
      {/each}
    {:else if $modal_options === EVar.TIME}
      <Time />
    {:else if $modal_options === EVar.NORMAL}
      <Normal />
    {:else if $modal_options === EVar.STRING || $modal_options === EVar.LONGSTRING}
      <String length={$modal_options === EVar.LONGSTRING ? 30 : 12} />
    {:else if $modal_options === EVar.FAENUMBER}
      <Number scale={FAE_SCALE} />
    {:else if $modal_options === EVar.NUMBER}
      <Number />
    {:else if $modal_options === EVar.NOISE}
      <Noise />
    
    {/if}
  </div>
{/if}

<style>
  .item {
    text-align: center;
    padding: 0.4rem;

    cursor: pointer;
    text-transform: capitalize;
    font-size: 0.75rem;
  }

  .modal {
    display: flex;
    flex-direction: column;
    pointer-events: all;
    position: absolute;
    z-index: 10001;
    background-color: rgba(72, 2, 75, 0.75);
    border-radius: 0.5rem;
    border: solid 0.1rem rgba(255, 255, 255, 0.418);
  }
  .contentRow {
    flex: 1;
    display: flex;
  }
</style>
