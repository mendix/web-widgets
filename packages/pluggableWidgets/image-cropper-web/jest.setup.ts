/**
 * Jest setup for image-cropper tests.
 *
 * Problem: when `canvas` npm package is installed, jsdom uses node-canvas. Its `drawImage`
 * rejects jsdom HTMLImageElement objects. Also, the test's `captureDrawImageCalls` helper spies on
 * `CanvasRenderingContext2D.prototype.drawImage` — which must be the mock class prototype for the
 * spy to fire.
 *
 * Fix:
 * 1. Replace `global.CanvasRenderingContext2D` with the jest-canvas-mock class.
 * 2. Override `HTMLCanvasElement.prototype.getContext` to return a MockCRC2D instance.
 *    This makes the context returned by our code an instance of MockCRC2D, so the spec's spy
 *    on `CanvasRenderingContext2D.prototype.drawImage` (which equals MockCRC2D.prototype.drawImage)
 *    fires correctly.
 * 3. Override `HTMLCanvasElement.prototype.toBlob` to return a valid Blob synchronously
 *    (avoiding node-canvas toBuffer issues in tests).
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MockCRC2D = require("jest-canvas-mock/lib/classes/CanvasRenderingContext2D").default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MockImageBitmap = require("jest-canvas-mock/lib/classes/ImageBitmap").default;

// Make global.CanvasRenderingContext2D the mock class so spec spies on the right prototype
(global as any).CanvasRenderingContext2D = MockCRC2D;
// MockCRC2D's drawImage references ImageBitmap globally — provide a stub if jsdom doesn't have it
if (!(global as any).ImageBitmap) {
    (global as any).ImageBitmap = MockImageBitmap;
}

// Per-canvas context map for idempotency
const contextMap = new WeakMap<HTMLCanvasElement, InstanceType<typeof MockCRC2D>>();

// Patch HTMLCanvasElement.prototype.getContext — jsdom exposes this as a regular JS method
const origGetContext = HTMLCanvasElement.prototype.getContext;
(HTMLCanvasElement.prototype as any).getContext = function (
    this: HTMLCanvasElement,
    type: string,
    ...rest: unknown[]
): unknown {
    if (type === "2d") {
        if (!contextMap.has(this)) {
            contextMap.set(this, new MockCRC2D(this));
        }
        return contextMap.get(this);
    }
    return (origGetContext as Function).apply(this, [type, ...rest]);
};

// Patch HTMLCanvasElement.prototype.toBlob to avoid node-canvas's toBuffer path
(HTMLCanvasElement.prototype as any).toBlob = function (
    this: HTMLCanvasElement,
    callback: (blob: Blob | null) => void,
    type?: string
): void {
    const mime = type === "image/jpeg" || type === "image/webp" ? type : "image/png";
    const length = this.width * this.height * 4;
    const data = new Uint8Array(length);
    const blob = new Blob([data], { type: mime });
    setTimeout(() => callback(blob), 0);
};
