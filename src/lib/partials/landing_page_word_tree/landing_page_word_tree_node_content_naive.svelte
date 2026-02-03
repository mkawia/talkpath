<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';

	interface Props {
		node: {
			categoryKey: string;
			categoryName: string;
			ranking: number;
			words: {
				key: string;
				text: string;
			}[];
		};
		onWordTapped: (wordParams: { key: string; word: string }) => void;
		closeWordsTreeNodeModal: () => void;
	}

	let { node, onWordTapped, closeWordsTreeNodeModal }: Props = $props();

	let searchWord = $state('');

	const makeFilteredWOrds = (
		wordsPar: {
			key: string;
			text: string;
		}[],
		searchWordPar: string
	) => {
		if (!searchWordPar) {
			return wordsPar;
		}

		const lowerSearch = searchWordPar.toLowerCase();
		return wordsPar.filter((word) => word.text.toLowerCase().includes(lowerSearch));
	};

	const filteredWords = $derived(makeFilteredWOrds(node.words, searchWord));
</script>

<div class="tree-node-naive-searcher-container">
	<!--make it bigger -->
	<Input type="text" bind:value={searchWord} placeholder="Search..." class="m-4" />

	{#if filteredWords.length === 0}
		<div class="empty-filtered-words">
			<p class="text-gray-500">No words found.</p>
		</div>
	{:else}
		<div class="tree-node-naive-searcher-list">
			{#each filteredWords as word}
				<button
					onclick={() => {
						onWordTapped({ key: word.key, word: word.text });
						closeWordsTreeNodeModal();
					}}
					class="tree-node-naive-searcher-item"
				>
					<!--
					<span class="tree-node-naive-searcher-item-text">{word.text}</span>
					-->
					<span class="highlighted-text">
						{@html word.text.replace(
							new RegExp(searchWord, 'gi'),
							(match) => `<mark class="highlighted-text-high">${match}</mark>`
						)}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.tree-node-naive-searcher-container {
		margin-top: 20px;
		display: flex;
		flex-direction: column;
		height: 400px;
		width: 100%;
		background-color: var(--talkpath-white);
		border: 1px solid var(--primary-color);
		border-radius: var(--border-radius);
		overflow: hidden;
		max-height: 500px;
		overflow-y: hidden;
	}

	.tree-node-naive-searcher-list {
		flex: 1;
		overflow-y: auto;
		padding: 20px 0;
	}

	.tree-node-naive-searcher-item {
		display: block;
		width: 100%;
		padding: 20px;
		border-bottom: 1px solid var(--muted-border-color);
		font-size: 1.2rem;
		color: var(--talkpath-text-gray);
		cursor: pointer;
		text-align: left;
	}

	.tree-node-naive-searcher-item:first-child {
		border-top: 1px solid var(--muted-border-color);
	}

	:global(.highlighted-text-high) {
		background-color: var(--lightest-primary-color);
	}

	.tree-node-naive-searcher-item:hover {
		background-color: var(--primary-color);
		color: var(--talkpath-white);
	}

	.empty-filtered-words {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
