<script lang="ts">
	import type { LandingWordsTreeNode } from '$lib/server/words/fetch_landing_page_words_tree/fetch_landing_page_words_tree';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import LandingPageWordTreeNodeContent from './landing_page_word_tree_node_content.svelte';

	interface Props {
		categoryName: string;
		status:
			| 'loading'
			| 'loaded'
			| {
					errorKind: 'fetch_error' | 'no_data';
					errorBody: string;
			  };
		node: LandingWordsTreeNode | null;
		onWordTapped: (wordParams: { key: string; word: string }) => void;
	}

	let { categoryName, status, node, onWordTapped }: Props = $props();

	let showNodeWordsDialog = $state(false);

	const closeWordsTreeNodeModal = () => {
		showNodeWordsDialog = false;
	};
</script>

<Dialog.Root bind:open={showNodeWordsDialog}>
	<Dialog.Content class="sm:max-w-200">
		<!-- just in case -->
		{#if node}
			<LandingPageWordTreeNodeContent {closeWordsTreeNodeModal} {node} {onWordTapped} />
		{/if}
	</Dialog.Content>
</Dialog.Root>

<button
	class="words-node"
	onclick={() => {
		if (status === 'loaded' && node) {
			showNodeWordsDialog = true;
		}
	}}
	disabled={status === 'loading'}
	class:is-loading={status === 'loading'}
>
	<div class="words-node-interior">
		<div class="words-node-content">
			<span class="category-name">{categoryName}</span>
		</div>
	</div>
</button>

<style>
	.words-node {
		/* Shape & Size */
		width: 150px;
		height: 90px;
		border-radius: var(--border-radius);
		position: relative;

		/* Reset Button defaults */
		background: transparent;
		border: none;
		padding: 0;

		/* Layout */
		display: flex;

		/* Interaction */
		cursor: pointer;
		outline: none;
		text-decoration: none;

		/* Lift effect logic without shadow */
		transform: translateY(0);
		transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.words-node-interior {
		width: 100%;
		height: 100%;
		border-radius: var(--border-radius);

		/* Colors & Borders - Default State */
		background-color: var(--talkpath-white);
		border: 2px solid var(--border-color);
		border-bottom-width: 4px; /* Thicker bottom for 3D feel without shadow */

		/* Layout */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.75rem;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.words-node-content {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
	}

	.category-name {
		font-size: 1rem;
		font-weight: 700;
		color: var(--primary-color);
		text-align: center;
		line-height: 1.3;
		letter-spacing: 0.02em;

		/* Constraint text width for centering */
		display: block;
		max-width: 95%;
		word-wrap: break-word;
		transition: color 0.2s ease;
	}

	/* Loading State */
	.words-node.is-loading {
		/*	pointer-events: none; */
		cursor: not-allowed;
	}

	.words-node.is-loading .words-node-interior {
		background-color: #f0f0f0;
		border-color: #e0e0e0;
		/* Shimmer effect background */
		background: linear-gradient(
			90deg,
			var(--talkpath-white) 25%,
			#f5f5f5 50%,
			var(--talkpath-white) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite linear;
	}

	.words-node.is-loading .category-name {
		opacity: 0.1;
		cursor: not-allowed;
		color: var(--talkpath-text-gray);
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	/* Hover State (only when not loading) */
	.words-node:not(.is-loading):hover {
		transform: translateY(-2px);
	}

	.words-node:not(.is-loading):hover .words-node-interior {
		border-color: var(--primary-color);
		border-bottom-color: var(--primary-color);
		background-color: var(--light-primary-color);
	}

	.words-node:not(.is-loading):hover .category-name {
		color: var(--talkpath-white);
	}

	/* Active/Click State (only when not loading) */
	.words-node:not(.is-loading):active {
		transform: translateY(1px);
	}

	.words-node:not(.is-loading):active .words-node-interior {
		border-color: var(--primary-color);
		border-bottom-width: 2px; /* Press effect */
		margin-top: 2px; /* Visual press offset */
		background-color: var(--lightest-primary-color);
	}

	/* Responsive adjustments */
	@media (max-width: 600px) {
		.words-node {
			width: 130px;
			height: 80px;
		}

		.category-name {
			font-size: 0.9rem;
		}
	}
</style>
