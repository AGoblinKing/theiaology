<script lang="ts">
  // organize-imports-ignore

  import Box from './Box.svelte'
  import { timeline, timeline_json } from 'src/buffer'
  import { Commands, ETimeline, EVar } from 'src/buffer/timeline'
  import {
    modal_cursor,
    modal_default,
    modal_location,
    modal_options,
    modal_visible,
  } from './editor'
  import { mouse_page, mouse_pos } from 'src/input/mouse'

  import { Color } from 'three'

  export let i = 0

  const color = new Color()

  $: item = $timeline_json.flat[i] || { data: [0], children: {} }
  $: label = i === 0 ? 'ROOT' : $timeline_json.markers[i] || i
  $: command = $timeline.command(i)

  function addTo(index: number) {
    modal_visible.set(false)
    timeline.$.add(0, ETimeline.DEFINE, index, 0, 0, 0)
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

  function updateModal() {
    modal_location.set(modal_location.$.set($mouse_page.x, $mouse_page.y))
  }

  function chooseCommand(e) {
    if (command === 0) return
    // see if its a number
    modal_options.set(
      Object.keys(ETimeline).filter((k) => {
        const v = parseInt(k, 10)
        if (Number.isNaN(v)) {
          return true
        }
      })
    )
    updateModal()
    modal_visible.set((res) => {
      const com = ETimeline[res]
      timeline.$.command(i, com)

      switch (ETimeline[res]) {
        case ETimeline.DEFINE:
        case ETimeline.FLOCK:
          break
        default:
          for (let child of Object.keys(item.children)) {
            remove(parseInt(child, 10))
          }
      }
      timeline.poke()
    })
  }

  function inputString() {
    updateModal()
    modal_options.set(EVar.String)
    modal_default.set(timeline.$.define(i))
    modal_visible.set((res) => {
      timeline.$.define(i, res)
      timeline.poke()
      modal_visible.set(false)
    })
  }

  function inputNumber(cursor: number) {
    updateModal()
    modal_options.set(EVar.Number)
    modal_cursor.set(cursor)
    modal_default.set(timeline.$[`data${cursor + 1}`](i))
    modal_visible.set((res) => {
      timeline.$[`data${cursor + 1}`](i, res)
      timeline.poke()
      modal_visible.set(false)
    })
  }
  function inputColor(cursor: number) {
    updateModal()
    modal_options.set(EVar.Color)
    modal_cursor.set(cursor)
    modal_visible.set((res) => {
      timeline.$[`data${cursor + 1}`](i, res)
      timeline.poke()
      modal_visible.set(false)
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

    {#if Commands[command]}
      {#each Object.entries(Commands[command]) as [key, value], index (key)}
        {#if value === EVar.String}
          <Box flex click={inputString}>
            "{$timeline.define(i)}"
          </Box>
        {:else if value === EVar.Number || value === EVar.Positive || value == EVar.Negative}
          <Box flex click={() => inputNumber(index)}>
            {$timeline[`data${index + 1}`](i)}
          </Box>
        {:else if value == EVar.Position}
          <Box flex click={() => inputNumber(index)}>
            {$timeline.data1(i)}
          </Box>
          <Box flex click={() => inputNumber(index + 1)}>
            {$timeline.data2(i)}
          </Box>
          <Box flex click={() => inputNumber(index + 2)}>
            {$timeline.data3(i)}
          </Box>
        {:else if value === EVar.Color}
          <Box flex click={() => inputColor(index)}>
            <div
              class="color"
              style="background-color: #{color
                .set($timeline[`data${index + 1}`](i))
                .getHexString()}"
            />
          </Box>
        {:else}
          <Box flex />
        {/if}
      {/each}
    {/if}

    {#if i === 0 || item.data[1] === ETimeline.FLOCK || item.data[1] === ETimeline.DEFINE}
      <Box click={() => addTo(i)}>+</Box>
    {:else if item.data[1] !== ETimeline.DEFINE && item.data[1] !== undefined}
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

  .color {
    width: 2rem;
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
