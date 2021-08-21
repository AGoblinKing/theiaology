<script lang="ts" context="module">
  import { key_down } from 'src/input/keyboard'
  import { Value } from 'src/value/value'
  interface INav {
    left?: string
    up?: string
    right?: string
    down?: string
    tag: string
  }
  const cursor = new Value<INav>({
    left: 'save',
    right: 'load',
    up: 'root',
    down: 'tags',
    tag: 'theiaology',
  })
  const navs = {}
  const doclick = new Value(false)
  function AttemptNav(dir: 'up' | 'down' | 'left' | 'right') {
    if (!cursor.$[dir]) return
    const attempts = cursor.$[dir].split('|')
    for (let attempt of attempts) {
      if (!navs[attempt]) continue
      cursor.set(navs[attempt])
      return
    }
  }
  key_down.on((k) => {
    if (!timeline_shown.$) return
      // vimish contro
    switch (k) {
      case 'e':
      case 'Enter':
      case 'i':
        doclick.set(true)
        break
      case 'r':
      case 'ArrowUp':
      case 'j':
        AttemptNav('up')
        break
      case 'f':
      case 'ArrowDown':
      case 'k':
        AttemptNav('down')
        break
      case 'q':
      case 'ArrowLeft':
      case 'l':
        AttemptNav('left')
        break
      case 'Tab':
      case 'ArrowRight':
      case ';':
        AttemptNav('right')
        break
    }
  })
</script>

<script lang="ts">
  import { onDestroy } from 'svelte'

  import {
    modal_location,
    modal_options,
    modal_visible,
    timeline_shown,
  } from './editor'

  export let nav: INav = {
    left: '',
    right: '',
    up: '',
    down: '',
    tag: '',
  }

  $: selected = $cursor.tag !== '' && $cursor.tag === nav.tag

  export let notilt = false
  export let tilt = 0
  export let hover = ''
  export let span = false
  // organize-imports-ignore
  export let flex = false
  export let bold = false
  export let upper = false

  export let click = () => {}

  if (nav.tag) navs[nav.tag] = nav

  let box: HTMLElement

  onDestroy(() => {
    switch (nav.tag) {
      case '':
        return
    }

    if (selected) {
      cursor.set(navs['theiaology'])
    }

    delete navs[nav.tag]
  })

  $: {
    if (selected && $doclick) {
      const inputs = box.querySelector('input')
      if (inputs) {
        inputs.click()
      } else {
        click()
      }

      doclick.set(false)
    }
  }

  function doClick() {
    if (nav.tag !== '') cursor.set(nav)

    click()
  }
</script>

<div
  class="box "
  class:span
  class:flex
  class:upper
  class:bold
  bind:this={box}
  on:click={doClick}
  class:notilt
  on:focus={() => {}}
  on:mouseover={() => {
    if (hover === '') return

    modal_location.set(modal_location.$.set(350, 20))
    modal_visible.set(() => {})
    modal_options.set(hover)
  }}
  style="filter: hue-rotate({selected ? 90 : tilt}deg);"
>
  <slot />
</div>

<style>
  .span {
    grid-column: span 3;
  }
  .upper {
    text-transform: uppercase;
  }
  .flex {
    flex: 1;
  }
  .box {
    background: rgb(72, 2, 75, 0.8);
    border: solid 0.1rem rgba(255, 255, 255, 0.25);
    color: rgb(250, 194, 9);
    font-size: 0.75rem;
    padding: 0.4rem;
    text-align: center;
    pointer-events: all;
    min-width: 0.5rem;
    cursor: pointer;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  .bold {
    font-weight: bold;
  }
  .box.notilt {
    filter: none !important;
  }
  .box:hover {
    filter: sepia(0.5) hue-rotate(-90deg) !important;
  }
</style>
