<script lang="ts">
	import LandingHeaderInput from './landing_header_input.svelte';
	import LandingHeaderLogo from './landing_header_logo.svelte';
	import LandingHeaderMenu from './landing_header_menu.svelte';

	interface Props {
		inputText: string;
		onEnterInputText: (submittedInputText: string) => void;
	}

	let { inputText = $bindable(), onEnterInputText }: Props = $props();
</script>

<header class="landing-header-w">
	<div class="landing-header-logo-w">
		<LandingHeaderLogo />
	</div>
	<LandingHeaderInput bind:inputText {onEnterInputText} />
	<button class="landing-header-menu-w">
		<LandingHeaderMenu />
	</button>
</header>

<style>
	header.landing-header-w {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid var(--border-color);
		/*background-color: #fd5e53;*/

		column-gap: 25px;
	}

	.landing-header-logo-w {
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
	}

	:global(.landing-header-logo-w svg.landing-header-logo-desktop-svg) {
		display: block;
		height: 36px;
		width: auto;
	}

	:global(.landing-header-logo-w svg.landing-header-logo-mobile-svg) {
		display: none;
	}

	/* on mobile */
	@media (max-width: 600px) {
		header.landing-header-w {
			column-gap: 10px;
			padding: 0.5rem;
		}
		:global(.landing-header-logo-w svg.landing-header-logo-desktop-svg) {
			display: none;
		}

		:global(.landing-header-logo-w svg.landing-header-logo-mobile-svg) {
			display: block;
			height: 24px;
			width: auto;
		}
	}

	/* Menu button styles */

	.landing-header-menu-w {
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		border: none;
		background: none;
		cursor: pointer;
		padding: 0;
		margin: 0;
	}

	:global(.landing-header-menu-w svg) {
		height: 36px;
		width: auto;
	}
</style>
