<script lang="ts">
	import type { PageData } from './$types';

	import LandingEnteredWords from '$lib/partials/landing_entered_words/landing_entered_words.svelte';
	import LandingHeader from '$lib/partials/landing_header/landing_header.svelte';
	import LandingPageWordTree from '$lib/partials/landing_page_word_tree/landing_page_word_tree.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const landingPageWordCategories = $derived(data.landingPageWordCategories);

	let inputText = $state('');
	let enteredWords = $state<
		{
			word: string;
			key: string;
		}[]
	>([]);

	const enteredWordsHasWord = (
		word: string,
		enteredWordsPar: {
			word: string;
			key: string;
		}[]
	) => {
		for (const enteredWordPar of enteredWordsPar) {
			//if a word like it exists already
			if (enteredWordPar.word === word) {
				return true;
			}
		}
		return false;
	};

	const onEnterInputText = (submittedInputText: string) => {
		inputText = '';
		//only enter unique, non-empty words
		if (
			submittedInputText.trim() !== '' &&
			!enteredWordsHasWord(submittedInputText.trim(), enteredWords)
		) {
			//we use empty since this a new word maybe
			enteredWords.push({
				word: submittedInputText.trim(),
				key: ''
			});
		}
	};

	const onWordTapped = (wordParams: { key: string; word: string }) => {
		//emptying just incase
		inputText = '';

		if (!enteredWordsHasWord(wordParams.word.trim(), enteredWords)) {
			//we use empty since this a new word maybe
			enteredWords.push(wordParams);
		}
	};
</script>

<div class="landing-page-w">
	<LandingHeader bind:inputText {onEnterInputText} />

	<LandingEnteredWords bind:enteredWords />

	<LandingPageWordTree {onWordTapped} {landingPageWordCategories} />
</div>

<style>
	.landing-page-w {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100vh;
		width: 100vw;
		overflow-x: hidden;
	}
</style>
