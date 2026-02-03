<script lang="ts">
	import LandingPageWordTreeNodeContentComplex from './landing_page_word_tree_node_content_complex.svelte';
	import LandingPageWordTreeNodeContentNaive from './landing_page_word_tree_node_content_naive.svelte';

	const LIST_OF_WORD_TOO_LONG = 5000; //the swahili dictionary is 14585

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
</script>

{#if node.words.length > LIST_OF_WORD_TOO_LONG}
	<LandingPageWordTreeNodeContentComplex {closeWordsTreeNodeModal} {node} {onWordTapped} />
{:else}
	<LandingPageWordTreeNodeContentNaive {closeWordsTreeNodeModal} {node} {onWordTapped} />
{/if}
