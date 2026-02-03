<script lang="ts">
	import './layout.css';

	//import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	//css import are done here, a bit expensive(like for error pages) but still
	import '$lib/styles/normalize.css';

	//these are now global
	import '$lib/styles/typography.css';

	import '$lib/styles/styles.css';

	interface Props {
		//data: LayoutData;
		children?: Snippet
	}

	let { children }: Props = $props();
</script>

<svelte:head><title>TalkPath</title></svelte:head>
{@render children?.()}
