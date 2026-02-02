<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchLandingPageWordsTreeNodeRemote } from '../../../routes/data.remote';
	import type { LandingWordsTreeNode } from '$lib/server/words/fetch_landing_page_words_tree/fetch_landing_page_words_tree';
	import LandingPageWordTreeNode from './landing_page_word_tree_node.svelte';

	interface Props {
		landingPageWordCategories: { key: string; name: string; ranking: number }[];
	}

	let { landingPageWordCategories }: Props = $props();

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

{#each landingPageWordCategories as landingPageWordCategory}
	<LandingPageWordTreeNode
		status={landingWordsTreeKV[landingPageWordCategory.key]?.status}
		node={landingWordsTreeKV[landingPageWordCategory.key]?.node}
	/>

	<!--
	<div class="landing-page-word-tree-category">
		<h2>{landingPageWordCategory.name}</h2>
		{#if landingWordsTreeKV[landingPageWordCategory.key]?.error}
			<p class="error">Error: {landingWordsTreeKV[landingPageWordCategory.key].error}</p>
		{:else if landingWordsTreeKV[landingPageWordCategory.key]?.node}
			<pre>{JSON.stringify(
					landingWordsTreeKV[landingPageWordCategory.key].node?.words.length,
					null,
					2
				)}</pre>
		{:else}
			<p>Loading...</p>
		{/if}
	</div>
	-->
{/each}
