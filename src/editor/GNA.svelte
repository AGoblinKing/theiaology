<script lang="ts">
  // organize-imports-ignore

  import { editor_shown } from './editor'
  import Timeline from './Timeline.svelte'
</script>

<toggle class="ribbon">TIMELINE</toggle>
<a
  class="ribbon github"
  href="https://github.com/agoblinking/Theia.games"
  target="_new">CODE</a
>

<gna class:hidden={!$editor_shown}>
  <Timeline />
</gna>

<style>
  .ribbon {
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    position: absolute;
    z-index: 1;
    padding: 0.5rem 5rem;
    color: white;
    text-decoration: none;
    text-align: center;
    transform: rotate(-45deg);
  }

  .ribbon:hover {
    background-color: rgb(7, 136, 179);
  }

  toggle {
    top: 1.5rem;
    left: -5rem;
    font-size: 1.5rem;
    border: 0.5rem solid white;

    background-color: darkslateblue;
  }

  .github {
    top: 0.5rem;
    left: -5.1rem;
    font-size: 0.75rem;
    border: 0.25rem solid white;

    padding: 0.25rem 5rem;
    background-color: darkslategray;
  }
  gna {
    top: 0;
    left: 0;
    position: absolute;
  }

  .hidden {
    display: none;
  }
</style>
