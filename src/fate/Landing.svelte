<script>
import { url } from "src/input/browser";



import { landing_shown } from "./editor";

function submit() {
    window.location.pathname = input.value
}
let input
</script>

{#if $landing_shown}
<div class="landing">
    <div class="portal"/>
    <div class="sprites" />

    <div class="aligner">
    <div class="title">Vox.Run</div>
    <div class="links">
        <div class="history">
          
        </div>
        <div class="pins"></div>
    </div>
        <input type="text" class="button url" placeholder="Which Realm?" bind:this={input} value={$url.join("/")
}        on:blur={() => {
            input.value !== $url.join("/") && submit()
        }} on:keydown={(e) => {
            e.key == "Enter" && submit();
        }} />

        <div class="button url r" on:click={() => landing_shown.set(false)}>
            X
        </div>
    </div>
</div>
{/if}

<style>

.title {
    font-size: 12rem;
    color: rgb(0, 110, 255, 0.75);
    font-weight: bold;
    text-shadow: -1.5rem -1.5rem 0 rgb(0, 110, 255, 0.1), 1.5rem -1.5rem 0 rgb(0, 110, 255, 0.1),
			-1.5rem 1.5rem 0 rgb(0, 110, 255, 0.1), 1.5rem 1.5rem 0 rgb(0, 110, 255, 0.1);
    filter: hue-rotate(90deg);

}
.r {
    filter: hue-rotate(90deg);
}
.button.url {
    margin-top: 10vh;
}
.aligner {
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
    z-index: 5;

}
.landing {
    pointer-events: all;
    position: absolute;
    display: flex;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;   
    align-items: center;
    justify-content: center;
    background-color: black;
    opacity: 0.9;
 

    box-shadow: inset 0 5vh 5rem rgba(0, 140, 255, 0.2),
			inset 0 -5vh 5rem rgba(0, 140, 255, 0.2),
			inset 40vw 0 5rem rgba(0, 140, 255, 0.2),
			inset -40vw 0 5rem rgba(0, 140, 255, 0.2) !important;
}

.url::placeholder {
    color: rgba(250, 253, 255, 0.8);
}
.portal {
    background-image: url("/image/portal.png");
    background-size: 100% 100%;
    image-rendering: pixelated;
    position: absolute;
    display: flex;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;  
    opacity: 0.1;
    animation: blink infinite 2s ease-in-out alternate;
}
.sprites {
    background-image: url('/image/patterns.png');
    background-repeat: repeat;
    background-size: 0.1%;
    position: absolute;
    display: flex;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;  
    opacity: 0.05;
    animation: boing infinite 10s ease-in-out alternate;
}
.button:active {
		background-color: rgb(0, 32, 53) !important;
	}
	.button:hover {
		background-color: rgb(0, 106, 206) !important;
		color: rgb(0, 225, 255);
		cursor: pointer;
		padding: 0.5vh 7.5vh;
		animation: beep 250ms alternate infinite;
	}

.button {
    overflow: hidden;
    border: 0.5vh solid rgb(0, 106, 206);
		border-radius: 10vh;
		color: gold;
		padding: 0.5vh 5vh;
		font-size: 3vh;
		outline: none;
		background-color: rgb(0, 110, 255);
		text-align: center;
		justify-self: center;
		font-weight: 500;
        pointer-events: all;
		align-self: center;
		margin: 1vh;
		box-shadow: 0 0 5vh rgb(0, 65, 150);
		text-transform: uppercase;
		text-shadow: -1.5rem -1.5rem 0 #111, 1.5rem -1.5rem 0 #111,
			-1.5rem 1.5rem 0 #111, 1.5rem 1.5rem 0 #111;
		transition: all cubic-bezier(0.36, -1.2, 0.59, 1.67) 250ms;
}
@keyframes beep {
		0% {
			opacity: 95%;
		}
		100% {
			opacity: 100%;
		}
	}
@keyframes boing {
    0% {
        background-size: 1%;
    }

    100% {
        background-size: 0.1%;
    }
}

@keyframes fader {
    0% {
        color: rgba(238, 223, 8, 0.4);
    }
    100% {
        color: rgba(0, 140, 255, 0.6);
    }
}
@keyframes blink {
    0% {
        opacity: 0.1;
    }

    100% {
        opacity: 0.15;
    }
}
</style>