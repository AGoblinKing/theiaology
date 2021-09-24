<script lang="ts">
  // organize-imports-ignore
  import { MIDI } from 'src/controller/audio'

  import { first } from 'src/realm'
  import Box from './Box.svelte'

  $: score = $first.score
</script>

{#if $score !== 0}
  <Box style="position: absolute; right: 0; top: 0;z-index: 10000;">
    {MIDI(80, 100, 0.5) || $score}
  </Box>
{/if}
