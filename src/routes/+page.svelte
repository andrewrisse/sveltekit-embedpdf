<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { WebWorkerEngine } from '@embedpdf/engines/worker';
	import type { PdfDocumentObject, PdfPageObject } from '@embedpdf/models';

	let container: HTMLImageElement | null = $state(null);
	let imageUrl = $state('');
	let engine = $state<WebWorkerEngine | null>(null);

	// NON-REACTIVE
	let document: PdfDocumentObject; // using $state breaks this with embedPDF engine

	onMount(async () => {
		const worker = new Worker(new URL('./webworker.ts', import.meta.url), {
			type: 'module'
		});
		engine = new WebWorkerEngine(worker);

		// Initialize the engine
		await engine.initialize().toPromise();
	});

	onDestroy(() => {
		if (engine) engine.destroy();
	});

	$effect(() => {
		if (engine) {
			setFile();
		}
	});

	async function setFile() {
		if (engine) {
			const fileUrl = { id: 'my-doc', url: 'https://snippet.embedpdf.com/ebook.pdf' };
			document = await engine.openDocumentUrl(fileUrl).toPromise();
			const page = document.pages[0];
			await renderPage(page);
		}
	}

	async function renderPage(page: PdfPageObject) {
		if (engine) {
			const imageBlob = await engine
				.renderPage(document, page, {
					withAnnotations: true,
					scaleFactor: 1
				})
				.toPromise();

			if (imageUrl) {
				URL.revokeObjectURL(imageUrl);
			}
			imageUrl = URL.createObjectURL(imageBlob);
		}
	}
</script>

<div class="flex w-full flex-col">
	<div id="pdf-container" class=" mx-auto my-2">
		{#if imageUrl}
			<img bind:this={container} id="pdf-viewer" alt="pdf" src={imageUrl} />
		{/if}
	</div>
</div>
