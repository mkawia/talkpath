<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';

	const DOM_CHILDREN_LIMIT = 100;

	const MIN_CHARS_DEFAULT = 3;

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
	}

	let { node }: Props = $props();

	let searchWord = $state('');

	// 1. Logic to determine if we should even start searching
	// We require input if the list is massive to prevent useless initial renders
	const isSearchReady = $derived(searchWord.trim().length >= MIN_CHARS_DEFAULT);

	// 2. High-performance filter with early exit
	const filteredWords = $derived.by(() => {
		if (!isSearchReady) return [];

		const query = searchWord.toLowerCase();
		const matches = [];

		// We use a classic for-loop for maximum speed and the ability to 'break'
		for (let i = 0; i < node.words.length; i++) {
			if (node.words[i].text.toLowerCase().includes(query)) {
				matches.push(node.words[i]);
			}
			// Stop immediately once we reach our DOM limit
			if (matches.length >= DOM_CHILDREN_LIMIT) break;
		}

		return matches;
	});

	// Helper for Regex safety (escapes special chars like . * + etc)
	function escapeRegExp(str: string) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
</script>

<div class="tree-node-complex-searcher-container">
	<div>
		<Input type="text" bind:value={searchWord} placeholder="Type here..." class="m-4" />
		{#if searchWord && !isSearchReady}
			<div class="keep-typing-div">
				<p class="text-center text-sm text-gray-500 italic">Keep typing</p>
			</div>
		{/if}
	</div>

	{#if !isSearchReady && searchWord === ''}
		<div class="empty-filtered-words">
			<p class="text-gray-500">Searched words will appear here.</p>
		</div>
	{:else if isSearchReady && filteredWords.length === 0}
		<div class="empty-filtered-words">
			<p class="text-gray-500">No words found for "{searchWord}"</p>
		</div>
	{:else}
		<div class="rolodex-list">
			{#each filteredWords as word (word.key)}
				<div class="rolodex-item">
					<span class="highlighted-text">
						{#if searchWord}
							{@html word.text.replace(
								new RegExp(`(${escapeRegExp(searchWord)})`, 'gi'),
								(match) => `<mark class="highlighted-text-high">${match}</mark>`
							)}
						{:else}
							{word.text}
						{/if}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.tree-node-complex-searcher-container {
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
	}

	.rolodex-list {
		flex: 1;
		overflow-y: auto;
		padding: 20px 0;
	}

	.rolodex-item {
		padding: 20px;
		border-bottom: 1px solid var(--muted-border-color);
		font-size: 1.2rem;
		color: var(--talkpath-text-gray);
		cursor: pointer;
	}

	.rolodex-item:first-child {
		border-top: 1px solid var(--muted-border-color);
	}

	:global(.highlighted-text-high) {
		background-color: var(--lightest-primary-color);
		color: inherit;
		border-radius: 2px;
	}

	.rolodex-item:hover {
		background-color: var(--primary-color);
		color: var(--talkpath-white);
	}

	.empty-filtered-words {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.keep-typing-div {
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		margin-top: 10px;
		margin-left: 10px;
	}
</style>
