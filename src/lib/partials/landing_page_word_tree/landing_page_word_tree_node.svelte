<script lang="ts">
	import type { LandingWordsTreeNode } from '$lib/server/words/fetch_landing_page_words_tree/fetch_landing_page_words_tree';

	interface Props {
		status:
			| 'loading'
			| 'loaded'
			| {
					errorKind: 'fetch_error' | 'no_data';
					errorBody: string;
			  };
		node: LandingWordsTreeNode | null;
	}

	let { status, node }: Props = $props();
</script>

{#if status === 'loading'}
	<div class="shimmer-wrapper">
		<div class="shimmer"></div>
	</div>
{:else if status === 'loaded' && node}
	<div class="node-content">
		<h2>{node.categoryName}</h2>
		<p>{node.words.length}</p>
	</div>
{:else if typeof status === 'object' && status.errorKind}
	<div class="error">
		<h3>Error: {status.errorKind}</h3>
		<p>{status.errorBody}</p>
	</div>
{/if}

<style>
	.shimmer-wrapper {
		width: 100%;
		height: 100px;
		background: #f6f7f8;
		position: relative;
		overflow: hidden;
		border-radius: 8px;
	}

	.shimmer {
		width: 100%;
		height: 100%;
		background: linear-gradient(to right, #f6f7f8 0%, #eaeaea 50%, #f6f7f8 100%);
		position: absolute;
		top: 0;
		left: 0;
		animation: shimmer 1.5s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.node-content {
		padding: 16px;
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.error {
		padding: 16px;
		background: #ffe6e6;
		border-radius: 8px;
		color: #d9534f;
	}
</style>
