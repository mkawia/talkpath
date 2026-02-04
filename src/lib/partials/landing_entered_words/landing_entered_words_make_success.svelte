<script lang="ts">
	interface Props {
		successfullyMadeSentences: {
			sentence: string;
			language: string;
		}[];
	}

	let { successfullyMadeSentences = $bindable() }: Props = $props();
</script>

<div class="sentence-list-container">
	<div class="sentence-list">
		{#each successfullyMadeSentences as sentenceObj}
			{#if sentenceObj.language === 'en'}
				<button
					onclick={() => {
						const utterance = new SpeechSynthesisUtterance(sentenceObj.sentence);
						//utterance.lang = 'en-US';
						speechSynthesis.speak(utterance);
					}}
					class="sentence-item"
				>
					<span class="sentence-text">{sentenceObj.sentence}</span>
				</button>
			{:else}
				<button onclick={() => console.log(`oops`)} class="sentence-item">
					<span class="sentence-text">{sentenceObj.sentence}</span>
				</button>
			{/if}
		{/each}
	</div>
</div>

<style>
	.sentence-list-container {
		margin-top: 20px;
		display: flex;
		flex-direction: column;
		width: 100%;
		background-color: var(--talkpath-white);
		border: 1px solid var(--primary-color);
		border-radius: var(--border-radius);
		overflow: hidden;
		padding: 0;
	}

	.sentence-list {
		flex: 1;
		overflow-y: auto;
		padding: 0;
	}

	.sentence-item {
		display: block;
		width: 100%;
		padding: 20px;
		border-bottom: 1px solid var(--primary-color);
		font-size: 1.2rem;
		color: var(--talkpath-text-gray);
		cursor: pointer;
		text-align: left;
	}

	.sentence-item:last-child {
		border-bottom: none;
	}

	.sentence-item:hover {
		background-color: var(--primary-color);
		color: var(--talkpath-white);
	}
</style>
