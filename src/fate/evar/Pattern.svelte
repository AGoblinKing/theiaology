<script lang="ts">
export let i = 0
export let size = 2

const unit = 1/12 * 100 * 12

function Offset() {
    return `-${(i % 12) * unit}% -${Math.floor(i/12) * unit}%`
}
</script>

<div class="pattern" data-what={Offset()} style="width: {size}rem; height: {size}rem; background-position: {Offset()};" ></div>


<style>
.pattern {
    background: url('/image/patterns.png');
    background-size: 1200% 1200%;
    background-repeat: repeat;
}

.pattern:hover {
    cursor: url('/sprite/pointer.png') 0 0, pointer;
}
</style>