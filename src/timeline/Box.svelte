<script lang="ts" context="module">
  import { key_down, key_map } from 'src/input/keyboard'
  import { Value } from 'src/value/value'
  interface INav {
    left?: string
    up?: string
    right?: string
    down?: string
    tag: string
  }
  const cursor = new Value<INav>({
    right: 'workspace',
    down: 'music|vox|root',
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
   // @ts-ignore
  window.navs = navs
  key_down.on((k) => {
    if (!timeline_shown.$) return
 
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
      case 'ArrowRight':
      case ';':
        AttemptNav('right')
        break
      case 'Tab':
        AttemptNav(key_map.$['Shift'] ? 'left' : 'right')
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

  let tags = []
  if (nav.tag) {
    tags = nav.tag.split('|')
  }

  tags.forEach((tag) => {
    navs[tag] = nav
  })

  let box: HTMLElement

  onDestroy(() => {
    switch (nav.tag) {
      case '':
        return
    }

    if (selected) {
      cursor.set(navs['theiaology'])
    }

    tags.forEach((tag) => {
      delete navs[tag]
    })
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
  class="box"
  class:span
  class:flex
  class:upper
  class:selected
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
    grid-column: span 4;
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

  .selected {
    animation: bleep 1s ease-in-out infinite alternate;
  }

  @keyframes bleep {
    0% {
      opacity: 0.55;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.55;
    }
  }
</style>
