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
  import { mouse_page } from 'src/input/mouse'

  import { Commands, ETimeline, EVar } from './def-timeline'
  import { voxes } from 'src/buffer/vox'
  import { SaveScript } from 'src/file/save'

  export let i = 0

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
    modal_location.set(
      modal_location.$.set($mouse_page.x - 5, $mouse_page.y - 5)
    )
  }

  function chooseCommand() {
    if (command === 0) {
      SaveScript()
      return
    }
    // see if its a number
    modal_options.set(
      Object.keys(ETimeline).filter((k) => {
        const v = parseInt(k, 10)

        if (k === 'NONE' || Commands[ETimeline[k]] === undefined) return false

        if (window.Number.isNaN(v)) {
          return true
        }
      })
    )
    updateModal()
    modal_visible.set((res: string) => {
      const com: number = ETimeline[res]

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

  function inputEnum(cursor: number, en: any) {
    updateModal()

    modal_options.set(
      Object.keys(en).filter((k) => {
        const v = parseInt(k, 10)

        if (window.Number.isNaN(v)) {
          return true
        }
      })
    )

    modal_visible.set((res) => {
      timeline.$[`data${cursor}`](i, en[res])
      timeline.poke()
      modal_visible.set(false)
    })
  }

  function inputVox() {
    updateModal()

    modal_options.set(['None', ...Object.keys(voxes.$)])

    modal_visible.set((res) => {
      timeline.$.text(i, res)
      timeline.poke()
      modal_visible.set(false)
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
    modal_default.set(timeline.$[`data${cursor}`](i))
    modal_visible.set((res) => {
      timeline.$[`data${cursor}`](i, res)
      timeline.poke()
      modal_visible.set(false)
    })
  }

  function inputNormal(cursor: number) {
    updateModal()
    modal_options.set(EVar.NORMAL)
    modal_cursor.set(cursor)
    modal_default.set(timeline.$[`data${cursor}`](i))
    modal_visible.set((res) => {
      timeline.$[`data${cursor}`](i, res)
      timeline.poke()
      modal_visible.set(false)
    })
  }

  function inputTime() {
    updateModal()
    modal_options.set(EVar.TIME)
    modal_default.set(timeline.$.when(i))
    modal_visible.set((res) => {
      timeline.$.when(i, res)
      timeline.poke()
      modal_visible.set(false)
    })
  }
  function d0(t) {
    return `00${Math.floor(t)}`.slice(-2)
  }
  function submitColor(index: number, val: number) {
    timeline.$[`data${index}`](i, val)
    timeline.poke()
  }

  $: label = ETimeline[item.data[1]] || 'root'

  $: nadd = `${i}-add`
  $: ncomm = `${i}-command`
  $: ndata = `${i}-data`
  $: nremove = `${i}-remove`

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
      hover={label === 'root'
        ? 'Download a .json of the ROOT script'
        : 'Command'}
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
            hover={key}
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
          <Box
            flex
            hover={key}
            click={() => inputNumber(index)}
            nav={{ tag: `${i}-data-${index}` }}
          >
            {$timeline[`data${index}`](i)}
          </Box>
        {:else if value == EVar.VOX}
          <Box
            hover={key}
            flex
            tilt={-90}
            click={inputVox}
            nav={{ tag: `${i}-data-${index}` }}
          >
            {$timeline.text(i) === '' ? 'None' : $timeline.text(i)}
          </Box>
        {:else if value == EVar.VEC3}
          <Box
            flex
            hover={key}
            click={() => inputNumber(index)}
            nav={{ tag: `${i}-data-${index}` }}
          >
            {$timeline.data0(i)}
          </Box>
          <Box
            hover={key}
            flex
            click={() => inputNumber(index + 1)}
            nav={{ tag: `${i}-data-${index}` }}
          >
            {$timeline.data1(i)}
          </Box>
          <Box
            hover={key}
            flex
            click={() => inputNumber(index + 2)}
            nav={{ tag: `${i}-data-${index}` }}
          >
            {$timeline.data2(i)}
          </Box>
        {:else if value === EVar.COLOR}
          <Box hover={key} notilt flex nav={{ tag: `${i}-data-${index}` }}>
            <input
              type="color"
              value="#{`000000${$timeline[`data${index}`](i).toString(
                16
              )}`.slice(-6)}"
              on:change={(e) => {
                // @ts-ignore
                submitColor(index, parseInt(e.target.value.slice(1), 16))
              }}
            />
          </Box>
        {:else if typeof value === 'object'}
          <Box
            hover={key}
            flex
            tilt={-90}
            click={() => inputEnum(index, value)}
            nav={{ tag: `${i}-data-${index}` }}
          >
            {value[$timeline[`data${index}`](i)]}
          </Box>
        {:else if value === EVar.NORMAL}
          <Box flex hover={key} click={() => inputNormal(index)}>
            {Math.abs(($timeline[`data${index}`](i) / 1024) * 100).toFixed(0)}%
          </Box>
        {:else}
          <Box flex hover="{key} - Not Implemented" />
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
      <Box hover="When to Apply" click={inputTime}>
        {d0(item.data[0] / 60)}:{d0(item.data[0] % 60)}
      </Box>
    {/if}
  </div>
  <div class="children">
    {#each Object.keys(item.children).reverse() as key (key)}
      <svelte:self i={key} />
    {/each}
  </div>
</div>
{#if i === 0}
  {#each Object.keys($timeline_json.children).sort() as key}
    <svelte:self i={key} />
  {/each}
{/if}

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
