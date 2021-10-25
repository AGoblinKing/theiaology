<script lang="ts" context="module">
  let order_count = 0
  let cancel
  fantasy.on(($r) => {
    if (cancel) cancel()
    cancel = $r.fate.on(() => {
      order_count = 0
    })
  })
</script>

<script lang="ts">
  // organize-imports-ignore
  import Box from './Box.svelte'
  import { fantasy, first } from 'src/realm'
  
  import {
    mirror_shown,
    modal_cursor,
    modal_default,
    modal_location,
    modal_options,
    modal_visible,
  } from './editor'

  import { mouse_page } from 'src/input/mouse'
  
  import { Invocations, ESpell, EVar, ESpellHelp } from './weave'
  
  import { SaveScript } from 'src/input/save'
  import { NORMALIZER, FaeUnits } from 'src/config'
  import { hashcode } from './color'
  import { seconds } from 'src/controller/audio'
  import { IntToString, StringToInt } from 'src/buffer/atomic'
  import Pattern from './evar/Pattern.svelte'
  
  $: voxes = $first.voxes
  $: fate = $first.fate
  $: fateJSON = $first.fateJSON
  
  export let i = 0
  
  let poker = 0
  $: rootChildren =
    i === 0
      ? Object.keys($fateJSON._).sort((i) => $fate.when(parseInt(i, 10)))
      : []
  $: myChildren = Object.keys(item._).sort((i) => $fate.when(parseInt(i, 10)))

  $: item = $fateJSON.flat[i] || { $: [0], _: {} }
  $: invoke = $fate.spell(i)

  function addTo(index: number) {
    modal_visible.set(false)
    fate.$.add(0, ESpell.TOME, index, 0, 0, 0)
    fate.poke()
  }

  $: order = $fate && order_count++

  const viewer = new DataView(new ArrayBuffer(4))

  function remove(index: number) {
    modal_visible.set(false)

    if (index === 0) {
      mirror_shown.set(!mirror_shown.$)
      return
    }
    for (let child of Object.keys($fateJSON.flat[index]._)) {
      remove(parseInt(child, 10))
    }
    fate.$.free(index)
    fate.poke()
  }

  function updateModal() {
    modal_location.set(
      modal_location.$.set($mouse_page.x - 5, $mouse_page.y - 5)
    )
  }

  function inputInvoke() {
    if (invoke === 0) {
      SaveScript()
      return
    }
    // see if its a number
    modal_options.set(
      Object.keys(ESpell)
        .filter((k) => {
          const v = parseInt(k, 10)

          if (k === 'NONE' || Invocations[ESpell[k]] === undefined) return false

          if (window.Number.isNaN(v)) {
            return true
          }
        })
        .sort()
    )
    updateModal()
    modal_visible.set((res: string) => {
      const com: number = ESpell[res]

      fate.$.spell(i, com)

      switch (ESpell[res]) {
        case ESpell.TOME:
          break
        case ESpell.DO_REZ:
        case ESpell.FLOCK:
        case ESpell.SHAPE:
          fate.$.data0(i, 1)
          fate.$.data1(i, 1)
          fate.$.data2(i, 1)
        default:
          for (let child of Object.keys(item._)) {
            remove(parseInt(child, 10))
          }
      }
      fate.poke()
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
      fate.$[`data${cursor}`](i, en[res])
      fate.poke()
      modal_visible.set(false)
    })
  }

  function inputPattern(cursor: number) {
    updateModal()
    modal_options.set(EVar.PATTERN)
    modal_cursor.set(cursor)
    modal_default.set(fate.$[`data${cursor}`](i))
    modal_visible.set((res) => {
      fate.$[`data${cursor}`](i, res)
      fate.poke()
 
      modal_visible.set(false)
    })
  }

  function inputNoise(cursor: number) {
    updateModal()
    modal_options.set(EVar.NOISE)
    modal_cursor.set(cursor)
    modal_default.set(fate.$[`data${cursor}`](i))
    modal_visible.set((res) => {
      fate.$[`data${cursor}`](i, res)
    })
  }

  function inputVox() {
    updateModal()

    modal_options.set(['None', ...Object.keys(voxes.$)])

    modal_visible.set((res) => {
      fate.$.text(i, res)
      fate.poke()
      modal_visible.set(false)
    })
  }

  function inputString() {
    updateModal()
    modal_options.set(EVar.STRING)
    modal_default.set(fate.$.text(i))
    modal_visible.set((res) => {
      fate.$.text(i, res)
      fate.poke()
      modal_visible.set(false)
    })
  }
  function inputShort(cursor: number) {
    updateModal()
    modal_options.set(EVar.SHORTSTRING)
    modal_default.set(IntToString(fate.$[`data${cursor}`](i)))
    modal_visible.set((res) => {
      fate.$[`data${cursor}`](i, StringToInt(res))
      fate.poke()
      modal_visible.set(false)
    })
  }
  function inputNumber(cursor: number) {
    updateModal()
    modal_options.set(EVar.NUMBER)
    modal_cursor.set(cursor)
    modal_default.set(fate.$[`data${cursor}`](i))
    modal_visible.set((res) => {
      fate.$[`data${cursor}`](i, res)
      fate.poke()
      modal_visible.set(false)
    })
  }

  function inputFaeNumber(cursor: number) {
    updateModal()
    modal_options.set(EVar.FAENUMBER)
    modal_cursor.set(cursor)
    modal_default.set(fate.$[`data${cursor}`](i))
    modal_visible.set((res) => {
      fate.$[`data${cursor}`](i, res)
      fate.poke()
      modal_visible.set(false)
    })
  }

  function inputNormal(cursor: number) {
    updateModal()
    modal_options.set(EVar.NORMAL)
    modal_cursor.set(cursor)
    modal_default.set(fate.$[`data${cursor}`](i))
    modal_visible.set((res) => {
      fate.$[`data${cursor}`](i, res)
      fate.poke()
      modal_visible.set(false)
    })
  }

  function inputTime() {
    updateModal()
    modal_options.set(EVar.TIME)
    modal_default.set(fate.$.when(i))
    modal_visible.set((res) => {
      fate.$.when(i, res)
      fate.poke()
      modal_visible.set(false)
    })
  }
  function inputDataTime(di) {
    updateModal()
    modal_options.set(EVar.TIME)
    modal_default.set(fate.$[`data${di}`](i))
    modal_visible.set((res) => {
      fate.$[`data${di}`](i, res)
      fate.poke()
      modal_visible.set(false)
    })
  }
  function d0(t) {
    return `00${Math.floor(t)}`.slice(-2)
  }
  function submitColor(index: number, val: number) {
    fate.$[`data${index}`](i, val)
    fate.poke()
  }

  $: label = ESpell[item.$[1]] || 'weave'

  function NavData(index: number) {
    return {
      i,
      tag: `${order}-data-${index}|${i === 0 ? 'root-name' : ''}`,
      left: `${order}-data-${index - 1}|${order}-command`,
      // todo check these
      right: `${order}-data-${index + 1}|${order}-add`,
      up: `${order - 1}-data-${index}|${order - 1}-data-${index - 1}|${
        order - 1
      }-data-${index - 2}|${order - 1}-command|${up}`,
      down: `${order + 1}-data-${index}|${order + 1}-data-${index - 1}|${
        order + 1
      }-data-${index - 2}||${order + 1}-command`,
    }
  }
  // show line number and data
  const up = 'voxlast|music|theiaology'
</script>

<div
  data-poke={poker}
  data-order={order}
  class="node"
  class:root={i === 0 || item.$[2] === 0}
  class:time={$seconds === $fate.when(i)}
>
  <div class="items">
    <Box
      style="opacity: 0.85; font-weight: bold; border-radius: 0.5rem 0 0 0.5rem"
      tilt={40}
      hover={i === 0 ? 'TOGGLE MIRROR CODE EDITOR' : 'REMOVE'}
      click={() => remove(i)}
      nav={{
        i,
        tag: `${order}-remove`,
        right: `${order}-command`,
        up: `${order - 1}-remove|${
          order - 1
        }-command|vox-del-last|music-del|theiaology`,
        down: `${order + 1}-remove|${order + 1}-command`,
      }}
    >
      {i === 0 ? '>' : 'x'}
    </Box>
    <Box
      click={inputInvoke}
      upper
      hover={label === 'weave'
        ? `Download the weave as LISP`
        : ESpellHelp[item.$[1]] || 'Invocation'}
      tilt={(hashcode(label.slice(0, 3)) * 0.05) % 360}
      nav={{
        i,
        tag: `${order}-command|${i === 0 ? 'root' : ''}|last`,
        left: `${order}-remove|${order}-add}`,
        right: `${order}-data-0|${order}-time|${order}-add|${order}-remove`,
        up: `${order - 1}-command|${up}`,
        down: `${order + 1}-command`,
      }}
    >
      {label}
    </Box>

    {#if Invocations[invoke]}
      {#each Object.entries(Invocations[invoke]) as [key, value], index (key)}
        {#if value === EVar.STRING}
          <Box
            flex
            tilt={hashcode($fate.text(i)) % 360}
            hover={key}
            click={inputString}
            nav={NavData(index)}
          >
            "{$fate.text(i)}"
          </Box>
        {:else if value === EVar.SHORTSTRING}
          <Box
            flex
            tilt={hashcode(IntToString($fate[`data${index}`](i))) % 360}
            hover={key}
            click={() => inputShort(index)}
            nav={NavData(index)}
          >
            "{IntToString($fate[`data${index}`](i))}"
          </Box>
        {:else if value === EVar.NUMBER || value === EVar.POSITIVE || value == EVar.NEGATIVE}
          <Box
            flex
            hover={key}
            click={() => inputNumber(index)}
            nav={NavData(index)}
          >
            {$fate[`data${index}`](i)}
          </Box>
        {:else if value === EVar.FAENUMBER || value === EVar.FAEPOSITIVE}
          <Box
            flex
            hover={key}
            click={() => inputFaeNumber(index)}
            nav={NavData(index)}
          >
            {FaeUnits($fate[`data${index}`](i))}
          </Box>
        {:else if value == EVar.VOX}
          <Box
            hover={key}
            flex
            tilt={-90}
            click={inputVox}
            nav={NavData(index)}
          >
            {$fate.text(i) === '' ? 'None' : $fate.text(i)}
          </Box>
        {:else if value === EVar.COLOR}
          <Box hover={key} notilt flex nav={NavData(index)}>
            <input
              type="color"
              value="#{`000000${$fate[`data${index}`](i).toString(16)}`.slice(
                -6
              )}"
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
            nav={NavData(index)}
          >
            {value[$fate[`data${index}`](i)]}
          </Box>
        {:else if value === EVar.NORMAL}
          <Box
            flex
            nav={NavData(index)}
            hover={key}
            click={() => inputNormal(index)}
          >
            {Math.abs(($fate[`data${index}`](i) / NORMALIZER) * 100).toFixed(
              0
            )}%
          </Box>
        {:else if value === EVar.BOOL}
          <Box
            flex
            nav={NavData(index)}
            hover={key}
            click={() => {
              // @ts-ignore
              $fate[`data${index}`](i, $fate[`data${index}`](i) ? 0 : 1)
              fate.poke()
            }}
          >
            <input type="checkbox" checked={$fate[`data${index}`](i)} />
          </Box>
        {:else if value === EVar.TIME}
          <Box
            flex
            nav={NavData(index)}
            hover={key}
            click={() => inputDataTime(index)}
          >
            {d0($fate[`data${index}`](i) / 60)}:{d0(
              $fate[`data${index}`](i) % 60
            )}
          </Box>
        {:else if value === EVar.NOISE}
          <Box
            flex
            nav={NavData(index)}
            hover={key}
            click={() => inputNoise(index)}
          >
            🎰 {viewer.setInt32(0, $fate[`data${index}`](i)) ||
              viewer.getUint8(0).toString(16)}
            {$fate && viewer.getUint8(1).toString(16)}
            {$fate && viewer.getUint8(2).toString(16)}
            {$fate && viewer.getUint8(3).toString(16)}
          </Box>
        {:else if value === EVar.PATTERN}
          <Box
            flex
            nav={NavData(index)}
            hover={key}
            click={() => inputPattern(index)}
          >
            <Pattern i={$fate[`data${index}`](i)} />
          </Box>
        {:else}
          <Box flex nav={NavData(index)} hover="{key} - Not Implemented" />
        {/if}
      {/each}
    {:else if i === 0}
      <Box hover="Theia File Name" flex click={inputString} nav={NavData(0)}>
        "{$fate.text(i)}"
      </Box>
    {/if}

    {#if i === 0 || item.$[1] === ESpell.TOME}
      <Box
        tilt={180}
        click={() => addTo(i)}
        hover="Add"
        style=" border-radius: 0 0.5rem 0.5rem 0rem;"
        nav={{
          i,
          tag: `${order}-add`,
          left: `${order}-data-2|${order}-data-1|${order}-data-0|${order}-command`,

          up: `${order - 1}-add|${up}`,
          down: `${order + 1}-add|${order + 1}-data-2|${order + 1}-data-1|${
            order + 1
          }-data-0`,
        }}>+</Box
      >
    {:else if item.$[1] !== ESpell.TOME && item.$[1] !== undefined}
      <Box
        style="margin-right: 1.5rem;"
        nav={{
          i,
          tag: `${order}-add`,
          left: `${order}-data-2|${order}-data-1|${order}-data-0|${order}-command`,
          up: `${order - 1}-add|${order - 1}-data-2|${order - 1}-data-1|${
            order - 1
          }-data-0|${up}`,
          down: `${order + 1}-add|${order + 1}-data-2|${order + 1}-data-1|${
            order + 1
          }-data-0|${order + 1}-command`,
        }}
        hover="When to Evoke"
        click={inputTime}
        tilt={-45}
      >
        {d0(item.$[0] / 60)}:{d0(item.$[0] % 60)}
      </Box>
    {/if}
  </div>
  <div class="children">
    {#each myChildren as key}
      <svelte:self i={key} />
    {/each}
  </div>
</div>

{#if i === 0 && $fate}
  {#each rootChildren as key, idx (Math.random())}
    <svelte:self i={key} />
  {/each}
{/if}

<style>
  .node.root {
    margin: 0;
  }

  .node {
    cursor: url('/sprite/pointer.png') 0 0, pointer;
    margin-left: 1.5rem;
  }

  .items {
    display: flex;
  }
</style>
