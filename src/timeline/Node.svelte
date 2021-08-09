<script lang="ts">
  // organize-imports-ignore

  import Box from './Box.svelte'
  import { timeline, timeline_json } from 'src/buffer'

  import {
    modal_cursor,
    modal_default,
    modal_location,
    modal_options,
    modal_visible,
  } from './editor'
  import { mouse_page, mouse_pos } from 'src/input/mouse'

  import { Color } from 'three'
  import { Commands, ETimeline, EVar } from './def-timeline'
  import { hashcode } from './color'

  export let i = 0

  const color = new Color()

  $: item = $timeline_json.flat[i] || { data: [0], children: {} }
  $: command = $timeline.command(i)

  function addTo(index: number) {
    modal_visible.set(false)
    timeline.$.add(0, ETimeline.TAG, index, 0, 0, 0)
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

  function chooseCommand() {
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
        case ETimeline.TAG:
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
    modal_options.set(EVar.STRING)
    modal_default.set(timeline.$.text(i))
    modal_visible.set((res) => {
      timeline.$.text(i, res)
      timeline.poke()
      modal_visible.set(false)
    })
  }

  function inputNumber(cursor: number) {
    updateModal()
    modal_options.set(EVar.NUMBER)
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
    modal_options.set(EVar.COLOR)
    modal_cursor.set(cursor)
    modal_visible.set((res) => {
      timeline.$[`data${cursor + 1}`](i, res)
      timeline.poke()
      modal_visible.set(false)
    })
  }
  $: label = ETimeline[item.data[1]] || 'root'

  $: nadd = `${i}-add`
  $: ncomm = `${i}-command`
  $: ndata = `${i}-data`
  $: nremove = `${i}-remove`

  // TODO:
  // calc these based on the position in the tree.
  // The tree is explored by svelte deterministically
  $: downi = i - 1
  $: upi = i + 1

  function NavData(count: number, start = 0, reverse = false) {
    let str = []
    for (let x = start; x < start + count; x++) {
      str.push(`${ndata}-${x}`)
    }

    if (reverse) {
      str = str.reverse()
    }

    return str.join('|')
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
    <Box
      hover="Remove"
      click={() => remove(i)}
      nav={{
        tag: nremove,
        left: `${nadd}|${NavData(3, 0, true)}|${ncomm}`,
        right: `${ncomm}`,
        up: `${i + 1}-remove|${i + 1}-command|theiaology`,
        down: `${i - 1}-remove|${i - 1}-command|theiaology`,
      }}
    >
      {i === 0 ? '>' : 'x'}
    </Box>
    <Box
      click={chooseCommand}
      upper
      hover={label === 'root' ? 'ROOT' : 'Command'}
      nav={{
        tag: `${i}-command`,
        left: `${nremove}|${nadd}|${NavData(3, 0, true)}`,
        right: `${i}-data-0|${nadd}|${nremove}`,
        up: `${i - 1}-command|theiaology`,
      }}
    >
      {label}
    </Box>

    {#if Commands[command]}
      {#each Object.entries(Commands[command]) as [key, value], index (key)}
        {#if value === EVar.STRING}
          <Box
            flex
            click={inputString}
            nav={{
              tag: `${ndata}-${index}`,
              left: ncomm,
              // todo check these
              right: `${ndata}-${index - 1}|${nadd}`,
              up: `${i}-command|${i}-data-${index - 1}`,
              down: `${i}-command|${i}-data-${index + 1}`,
            }}
          >
            "{$timeline.text(i)}"
          </Box>
        {:else if value === EVar.NUMBER || value === EVar.POSITIVE || value == EVar.NEGATIVE}
          <Box flex click={() => inputNumber(index)} nav={{ tag: `${i}-data` }}>
            {$timeline[`data${index + 1}`](i)}
          </Box>
        {:else if value == EVar.VEC3}
          <Box flex click={() => inputNumber(index)} nav={{ tag: `${i}-data` }}>
            {$timeline.data1(i)}
          </Box>
          <Box
            flex
            click={() => inputNumber(index + 1)}
            nav={{ tag: `${i}-data` }}
          >
            {$timeline.data2(i)}
          </Box>
          <Box
            flex
            click={() => inputNumber(index + 2)}
            nav={{ tag: `${i}-data` }}
          >
            {$timeline.data3(i)}
          </Box>
        {:else if value === EVar.COLOR}
          <Box flex click={() => inputColor(index)} nav={{ tag: `${i}-data` }}>
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
    {:else if i === 0}
      <Box
        hover="Theia File Name"
        flex
        click={inputString}
        nav={{ tag: `${i}-data` }}
      >
        "{$timeline.text(i)}"
      </Box>
    {/if}

    {#if i === 0 || item.data[1] === ETimeline.TAG}
      <Box
        click={() => addTo(i)}
        hover="Add"
        nav={{
          tag: `${i}-add`,

          left: `${NavData(3, 0, true)}|${ncomm}`,
          right: `${nremove}|${ncomm}`,
          up: `${i + 1}-add`,
          down: ``,
        }}>+</Box
      >
    {:else if item.data[1] !== ETimeline.TAG && item.data[1] !== undefined}
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
