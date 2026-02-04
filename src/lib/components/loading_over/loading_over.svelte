<script lang="ts">
	interface Props {
		description?: string;
	}

	let { description }: Props = $props();
</script>

<div class="loading-wrapper">
	{#if description}
		<small>{description}</small>
	{/if}
	<div class="loading-spinner"></div>
</div>

<style>
	.loading-wrapper {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		/* min-height: 100vh;*/
		/*width: 100%;*/
		display: flex;
		justify-content: center;
		align-items: center;
		background: #000;
		opacity: 0.5;
		z-index: 9998;
	}

	.loading-spinner {
		display: inline-block;
		width: 50px;
		height: 50px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;

		border-top-color: var(--primary-color);
		border-left-color: var(--light-primary-color);
		animation: spin 1s ease-in-out infinite;
	}

	@keyframes spin {
		to {
			-webkit-transform: rotate(360deg);
		}
	}
	@-webkit-keyframes spin {
		to {
			-webkit-transform: rotate(360deg);
		}
	}
</style>
