<script lang="ts">
	import type { LandingWordsTreeNode } from '$lib/server/words/fetch_landing_page_words_tree/fetch_landing_page_words_tree';

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
	}

	let { categoryName, status, node }: Props = $props();
</script>

<button class="words-node">
	<div class="words-node-interior">
		<div class="words-node-content">
			<span class="category-name">{categoryName}</span>
		</div>
		<div class="status-indicator" class:loading={status === 'loading'}></div>
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
		border: 2px solid var(--muted-border-color);
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
		color: var(--talkpath-text-gray);
		text-align: center;
		line-height: 1.3;
		letter-spacing: 0.02em;

		/* Constraint text width for centering */
		display: block;
		max-width: 95%;
		word-wrap: break-word;
		transition: color 0.2s ease;
	}

	/* Decorative Status Indicator (Top bar) */
	.status-indicator {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background-color: transparent;
		transition: background-color 0.3s ease;
	}

	.status-indicator.loading {
		background-color: var(--warning-light-txt-color);
		opacity: 0.5;
	}

	/* Hover State */
	.words-node:hover {
		transform: translateY(-2px);
	}

	.words-node:hover .words-node-interior {
		border-color: var(--primary-color);
		border-bottom-color: var(--primary-color);
		background-color: var(--light-primary-color);
	}

	.words-node:hover .category-name {
		color: var(--talkpath-white);
	}

	/* Active/Click State */
	.words-node:active {
		transform: translateY(1px);
	}

	.words-node:active .words-node-interior {
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
