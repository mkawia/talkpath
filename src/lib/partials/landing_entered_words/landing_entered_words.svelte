<script lang="ts">
	import { scale } from 'svelte/transition';
	import LandingEnteredWordsMake from './landing_entered_words_make.svelte';

	interface Props {
		enteredWords: {
			word: string;
			key: string;
		}[];
	}

	let { enteredWords = $bindable() }: Props = $props();

	function removeWord(word: string) {
		enteredWords = enteredWords.filter((w) => w.word !== word);
	}
</script>

<div
	class={enteredWords.length >= 2
		? 'entered-words-container can-make-sentences'
		: 'entered-words-container'}
>
	{#if enteredWords.length === 0}
		<div class="empty-entered-words">
			<span>Entered words will appear here.</span>
		</div>
	{:else}
		{#each enteredWords as enteredWord (enteredWord.word)}
			<div transition:scale class="word-pill-container">
				<div class="word-pill">
					<span>{enteredWord.word}</span>
				</div>
				<button class="close-btn" onclick={() => removeWord(enteredWord.word)}>×</button>
			</div>
		{/each}

		{#if enteredWords.length >= 2}
			<LandingEnteredWordsMake {enteredWords} />
		{/if}
	{/if}
</div>

<style>
	.word-pill-container {
		position: relative;
		display: inline-flex;
		align-items: center;
		margin: 0.5rem;
		margin-bottom: 1rem;
	}

	.word-pill {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		background-color: var(--talkpath-white);
		border-radius: var(--border-radius);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		font-size: 1rem;
		color: #333;
	}

	.close-btn {
		position: absolute;
		top: -0.5rem;
		right: -0.5rem;
		background: var(--talkpath-white);
		border: 1px solid #ccc;
		border-radius: 50%;
		color: #999;
		font-size: 0.9rem;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.close-btn:hover {
		color: #333;
		background-color: #f0f0f0;
	}

	.entered-words-container {
		position: relative;

		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		justify-content: center;
		padding: 1rem;
		margin-top: 0.5em;
		width: 70%;
		border-radius: var(--border-radius);
		border: 2px dashed var(--primary-color);

		margin-top: 2rem;
	}

	.entered-words-container.can-make-sentences {
		padding-bottom: 3em;
	}

	@media (max-width: 600px) {
		.entered-words-container {
			width: 99%;
		}
	}

	.empty-entered-words {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.empty-entered-words span {
		font-size: 1rem;
		text-align: center;
	}
</style>
