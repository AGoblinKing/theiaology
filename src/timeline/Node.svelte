<script context="module">
  import { Color } from 'three'
  const col = new Color()
</script>

<script lang="ts">
  // organize-imports-ignore

  import Box from './Box.svelte'
  import { timeline, timeline_json } from 'src/buffer'
  import { ETimeline } from 'src/buffer/timeline'
  import { modal_location, modal_options, modal_visible } from './editor'
  import { mouse_page, mouse_pos } from 'src/input/mouse'

  export let i = 0

  $: item = $timeline_json.flat[i] || { data: [0], children: {} }
  $: label = i === 0 ? 'ROOT' : $timeline_json.markers[i] || i

  function addTo(index: number) {
    modal_visible.set(false)
    timeline.$.add(0, ETimeline.Define, index, 0, 0, 0)
    timeline.poke()
  }

  function remove(index: number) {
    modal_visible.set(false)

    if (index === 0) return

    for (let child of Object.keys($timeline_json.flat[index].children)) {
      remove(parseInt(child, 10))
    }
    timeline.$.free(index)
    timeline.poke()
  }

  function chooseCommand(e) {
    // see if its a number
    modal_options.set(
      Object.keys(ETimeline).filter((k) => {
        const v = parseInt(k, 10)
        if (Number.isNaN(v)) {
          return true
        }
      })
    )
    modal_location.set(modal_location.$.set($mouse_page.x, $mouse_page.y))
    modal_visible.set((res) => {
      const com = ETimeline[res]
      timeline.$.command(i, com)

      switch (ETimeline[res]) {
        case ETimeline.Define:
        case ETimeline.Flock:
          break
        default:
          for (let child of Object.keys(item.children)) {
            remove(parseInt(child, 10))
          }
      }
      timeline.poke()
    })
  }
  // show line number and data
</script>

{#if i === 0}
  {#each Object.keys($timeline_json.children).sort() as key}
    <svelte:self i={key} />
  {/each}
{/if}

<div class="node" class:root={i === 0 || item.data[2] === 0}>
  <div class="items">
    <Box click={() => remove(i)}>
      {i === 0 ? '>' : 'x'}
    </Box>
    <Box click={chooseCommand} upper>
      {ETimeline[item.data[1]] || 'root'}
    </Box>
    {#if item.data.length > 0}
      <Box flex>{item.data.slice(3).join(':')}</Box>
    {/if}

    {#if i === 0 || item.data[1] === ETimeline.Flock || item.data[1] === ETimeline.Define}
      <Box click={() => addTo(i)}>+</Box>
    {:else if item.data[1] !== ETimeline.Define && item.data[1] !== undefined}
      <Box>
        {item.data[0] / 60}:{item.data[0] % 60}
      </Box>
    {/if}
  </div>
  <div class="children">
    {#each Object.keys(item.children) as key (key)}
      <svelte:self i={key} />
    {/each}
  </div>
</div>

<style>
  .children {
    background-color: rgba(2, 91, 255, 0.288);

    /*border: solid 0.25rem rgba(151, 2, 151, 0.555);*/
  }

  .node.root {
    margin: 0;
  }
  .node {
    cursor: pointer;
    margin-left: 1.75rem;
  }
  .items {
    display: flex;
  }
</style>
