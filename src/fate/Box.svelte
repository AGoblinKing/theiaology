<script lang="ts" context="module">
  const vec2 = new Vector2()
  const offset = new Vector2(1, 1).multiplyScalar(25)
</script>

<script lang="ts">
  import { onDestroy } from 'svelte'

  import { modal_location, modal_options, modal_visible } from './editor'

  import { cursor, doclick, navs } from './nav'

  import type { INav } from './nav'
  import { mouse_page } from 'src/input/mouse'
  import { Vector2 } from 'three'

  export let nav: INav = {
    left: '',
    right: '',
    up: '',
    down: '',
    tag: '',
    i: 0,
  }

  $: selected = $cursor.tag !== '' && $cursor.tag === nav.tag

  export let notilt = false
  export let tilt = 0
  export let hover = ''
  export let span = false
  // organize-imports-ignore
  export let flex = false

  export let upper = false
  export let style = ''
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
  on:contextmenu={(e) => {
    e.preventDefault()
    if (nav.tag !== '') cursor.set(nav)
  }}
  bind:this={box}
  on:click={doClick}
  class:notilt
  on:focus={() => {}}
  on:mouseover={() => {
    if (hover === '') return

    modal_location.set(vec2.copy(mouse_page.$).add(offset))
    modal_visible.set(() => {})
    modal_options.set(hover)
  }}
  style="filter: hue-rotate({selected ? 90 : tilt}deg);{style}"
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
    background: rgb(72, 2, 75, 0.9);
    border: solid 0.1rem rgba(255, 255, 255, 0.25);
    color: rgb(250, 194, 9);
    font-size: 0.75rem;
    padding: 0.4rem;
    text-align: center;
    pointer-events: all;
    min-width: 0.5rem;
    cursor: url("/sprite/pointer.png")0 0, pointer;

    display: flex;
    justify-content: center;
    align-items: center;
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
