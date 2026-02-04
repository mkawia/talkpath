<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

	import LoadingOver from '$lib/components/loading_over/loading_over.svelte';
	import {
		makeSentencesFromWordsRemote,
		type MakeGeminiMakeSentencesFromWordsRes
	} from '../../../routes/data.remote';
	import LandingEnteredWordsMakeSuccess from './landing_entered_words_make_success.svelte';

	interface Props {
		enteredWords: {
			word: string;
			key: string;
		}[];
	}

	let isMakingSentences = $state(false);

	let { enteredWords = $bindable() }: Props = $props();

	//successfully made sentences modal
	let successfullyMadeSentencesModalIsOpen = $state(false);
	let successfullyMadeSentences = $state<
		{
			sentence: string;
			language: string;
		}[]
	>([]);

	//error generating sentences modal
	let errorGeneratingSentencesModalIsOpen = $state(false);
	let errorGeneratingSentencesErrorObj = $state<{
		title: string;
		message: string;
	} | null>(null);

	const makeSentencesFromWordsLocal = async (words: string[]) => {
		isMakingSentences = true;
		try {
			const makeSentencesFromWordsRemoteRes: MakeGeminiMakeSentencesFromWordsRes =
				await makeSentencesFromWordsRemote(words);
			isMakingSentences = false;

			//try the happy path 🤞🤞🤞
			if (makeSentencesFromWordsRemoteRes.sentences.length > 0) {
				//just for funsy let's try for an error
				if (makeSentencesFromWordsRemoteRes.error) {
					console.warn(
						'Response brought both sentences and an error:',
						makeSentencesFromWordsRemoteRes.error
					);
					//let's also console the prompt
					console.info('Response prompt:', makeSentencesFromWordsRemoteRes.fullPrompt);
				}
				successfullyMadeSentences = makeSentencesFromWordsRemoteRes.sentences;
				successfullyMadeSentencesModalIsOpen = true;
			} else {
				//sad path 😢
				//here by dragons
				console.log(`Returned 'succesfully with error'`, makeSentencesFromWordsRemoteRes.error);

				const errorTitleAndText = makeMakeSentencesFromWordsRemoteResTitle(
					makeSentencesFromWordsRemoteRes.error
				);

				//show error modal
				errorGeneratingSentencesErrorObj = {
					title: errorTitleAndText.title,
					message: errorTitleAndText.message
				};
				errorGeneratingSentencesModalIsOpen = true;
			}
		} catch (error) {
			isMakingSentences = false;
			console.error('Error generating sentences:', error);
		}
	};

	const makeMakeSentencesFromWordsRemoteResTitle = (
		errorObj: null | {
			errorType:
				| 'GEMINI_API_NO_RESPONSE_TEXT'
				| 'GEMINI_API_RESPONSE_TEXT_JSON_PARSE_ERROR'
				| 'GEMINI_API_RESPONSE_PARSING_ERROR'
				| 'GEMINI_API_SERVICE_UNAVAILABLE_503'
				| 'GEMINI_API_SERVICE_UNAVAILABLE_429'
				| 'GEMINI_API_GENERATE_CONTENT_ERROR';
			//errObj: unknown;
			errString: string;
			responseText: string | null;
		}
	) => {
		let title = 'Error Generating Sentences';
		let message =
			'Sorry, an unknown error occurred while generating sentences. Please try again later.';

		if (errorObj) {
			switch (errorObj.errorType) {
				case 'GEMINI_API_NO_RESPONSE_TEXT':
					message = 'Sorry, no response was received from the Gemini API. Please try again later.';
					break;
				case 'GEMINI_API_RESPONSE_TEXT_JSON_PARSE_ERROR':
					message =
						'Sorry, there was an error parsing the response from the Gemini API. Please try again later.';
					break;
				case 'GEMINI_API_RESPONSE_PARSING_ERROR':
					message =
						'Sorry, there was an error processing the response from the Gemini API. Please try again later.';
					break;
				case 'GEMINI_API_SERVICE_UNAVAILABLE_503':
					message =
						'Sorry, the Gemini API service is currently unavailable (503). Please try again later.';
					break;
				case 'GEMINI_API_SERVICE_UNAVAILABLE_429':
					message =
						'Sorry, the Gemini API service is currently unavailable (429 - Too Many Requests). Please try again later.';
					break;
				case 'GEMINI_API_GENERATE_CONTENT_ERROR':
					message =
						'Sorry, there was an error generating content with the Gemini API. Please try again later.';
					break;
			}
		}

		return {
			title,
			message
		};
	};
</script>

<div class="make-sentence-container">
	<button
		disabled={isMakingSentences}
		onclick={() => {
			if (enteredWords.length === 0 || isMakingSentences) {
				return;
			}
			const words = enteredWords.map((w) => w.word);
			makeSentencesFromWordsLocal(words);
		}}>Make Sentence</button
	>
</div>

{#if isMakingSentences}
	<LoadingOver />
{/if}

<!-- successmodal  -->
<Dialog.Root bind:open={successfullyMadeSentencesModalIsOpen}>
	<Dialog.Content class="sm:max-w-200">
		<!-- just in case -->
		{#if successfullyMadeSentences.length > 0}
			<LandingEnteredWordsMakeSuccess {successfullyMadeSentences} />
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- error alert dialog -->
<AlertDialog.Root bind:open={errorGeneratingSentencesModalIsOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title
				>{errorGeneratingSentencesErrorObj
					? errorGeneratingSentencesErrorObj.title
					: 'Unknown Error'}</AlertDialog.Title
			>
			<AlertDialog.Description>
				{errorGeneratingSentencesErrorObj
					? errorGeneratingSentencesErrorObj.message
					: 'Unknown Error'}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Action>Ok</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<style>
	.make-sentence-container {
		display: flex;
		bottom: 0;
		right: 0;
		position: absolute;
		padding-bottom: 5px;
		padding-right: 5px;
	}

	button {
		background-color: var(--primary-color);
		color: var(--talkpath-white);
		border: none;
		border-radius: var(--border-radius);
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		transition:
			background-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	button:hover {
		background-color: var(--light-primary-color);
		box-shadow: 0 4px 6px var(--primary-color-mid-opacity);
	}

	button:active {
		background-color: var(--lightest-primary-color);
		box-shadow: 0 2px 4px var(--primary-color-high-opacity);
	}
</style>
