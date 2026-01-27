<script lang="ts">
	import LandingEnteredWords from '$lib/partials/landing_entered_words/landing_entered_words.svelte';
	import LandingHeader from '$lib/partials/landing_header/landing_header.svelte';
	let inputText = $state('');

	let enteredWords = $state<string[]>([]);

	const onEnterInputText = (submittedInputText: string) => {
		inputText = '';
		//only enter unique, non-empty words
		if (submittedInputText.trim() !== '' && !enteredWords.includes(submittedInputText.trim())) {
			enteredWords.push(submittedInputText.trim());
		}
	};
</script>

<div class="landing-page-w">
	<LandingHeader bind:inputText {onEnterInputText} />

	<LandingEnteredWords bind:enteredWords />
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
