<script lang="ts">
	interface Props {
		inputText: string;
		onEnterInputText: (submittedInputText: string) => void;
	}

	let { inputText = $bindable(), onEnterInputText }: Props = $props();
</script>

<input
	bind:value={inputText}
	onkeydown={(e) => {
		if (e.key === 'Enter' && inputText.trim().length > 0) {
			onEnterInputText(inputText);
		}
	}}
	class="prompt-input"
	type="text"
	placeholder="Type something..."
	id="landing-header-input-input"
/>

<style>
	/*

	Prompt input styles
	*/

	.prompt-input {
		flex: 1;
		margin: 0;
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
	}

	.prompt-input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 5px var(--primary-color);
	}
</style>
