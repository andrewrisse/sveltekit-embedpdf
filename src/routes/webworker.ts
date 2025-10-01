import { PdfiumEngineRunner, DEFAULT_PDFIUM_WASM_URL } from '@embedpdf/engines';

let runner: PdfiumEngineRunner | null = null;

// Auto-initialize with default WASM URL if no message received
async function autoInit() {
	try {
		const response = await fetch(DEFAULT_PDFIUM_WASM_URL);
		if (!response.ok) {
			throw new Error(`Failed to fetch WASM (${response.status} ${response.statusText})`);
		}
		const wasmBinary = await response.arrayBuffer();
		runner = new PdfiumEngineRunner(wasmBinary);
		await runner.prepare();
	} catch (error) {
		console.error('Worker auto-initialization failed:', error);
	}
}

// Start auto-initialization
autoInit();
