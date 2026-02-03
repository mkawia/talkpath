<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchLandingPageWordsTreeNodeRemote } from '../../../routes/data.remote';
	import type { LandingWordsTreeNode } from '$lib/server/words/fetch_landing_page_words_tree/fetch_landing_page_words_tree';
	import LandingPageWordTreeNode from './landing_page_word_tree_node.svelte';

	interface Props {
		landingPageWordCategories: { key: string; name: string; ranking: number }[];
		onWordTapped: (wordParams: { key: string; word: string }) => void;
	}

	let { landingPageWordCategories, onWordTapped }: Props = $props();

	let landingWordsTreeKV: {
		[key: string]: {
			node: LandingWordsTreeNode | null;
			status:
				| 'loading'
				| 'loaded'
				| {
						errorKind: 'fetch_error' | 'no_data';
						errorBody: string;
				  };
		};
	} = $state({});

	const fetchAllTreeNodes = async (landingPageWordCategoriesKeys: string[]) => {
		for (const landingPageWordCategoriesKey of landingPageWordCategoriesKeys) {
			fetchLandingPageWordsTreeNodeRemote(landingPageWordCategoriesKey)
				.catch((fetchingNodeErr) => {
					//find the index in the tree
					landingWordsTreeKV[landingPageWordCategoriesKey] = {
						node: null,
						status: {
							errorKind: 'fetch_error',
							errorBody: fetchingNodeErr?.message || 'Unknown error'
						}
					};
				})
				.then((fetchedNode) => {
					if (fetchedNode) {
						landingWordsTreeKV[landingPageWordCategoriesKey] = {
							node: fetchedNode,
							status: 'loaded'
						};
					} else {
						landingWordsTreeKV[landingPageWordCategoriesKey] = {
							node: null,
							status: {
								errorKind: 'no_data',
								errorBody: 'No data returned from server'
							}
						};
					}
				});
		}
	};

	onMount(() => {
		//first load all tree nodes for the categories
		for (const landingPageWordCategory of landingPageWordCategories) {
			landingWordsTreeKV[landingPageWordCategory.key] = {
				node: null,
				status: 'loading'
			};
		}

		//the remote
		fetchAllTreeNodes(landingPageWordCategories.map((l) => l.key));
	});
</script>

<!--
			

-->
<div class="bubbles-container">
	{#each landingPageWordCategories as landingPageWordCategory}
		<LandingPageWordTreeNode
			categoryName={landingPageWordCategory.name}
			status={landingWordsTreeKV[landingPageWordCategory.key]?.status}
			node={landingWordsTreeKV[landingPageWordCategory.key]?.node}
			{onWordTapped}
		/>
	{/each}
</div>

<style>
	.bubbles-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		padding: 3rem 0.25rem;
		max-width: 1200px;
		margin: 0 auto;
		margin-top: 2rem;
	}

	/* Connecting lines logic simulation for larger screens */
	@media (min-width: 768px) {
		.bubbles-container {
			position: relative;
			padding-top: 1rem;
		}
	}

	@media (max-width: 600px) {
		.bubbles-container {
			gap: 0.5rem;
		}
	}
</style>
