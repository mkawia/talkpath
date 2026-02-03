<script lang="ts">
	interface Props {
		enteredWords: {
			word: string;
			key: string;
		}[];
	}

	let { enteredWords = $bindable() }: Props = $props();
</script>

<div class="make-sentence-container">
	<button>Make Sentence</button>
</div>

<style>
	.make-sentence-container {
		display: flex;
		bottom: 0;
		right: 0;
		position: absolute;
		padding-bottom: 5px;
		padding-right: 5px;
	}

	button {
		background-color: var(--primary-color);
		color: var(--talkpath-white);
		border: none;
		border-radius: var(--border-radius);
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		transition:
			background-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	button:hover {
		background-color: var(--light-primary-color);
		box-shadow: 0 4px 6px var(--primary-color-mid-opacity);
	}

	button:active {
		background-color: var(--lightest-primary-color);
		box-shadow: 0 2px 4px var(--primary-color-high-opacity);
	}
</style>
