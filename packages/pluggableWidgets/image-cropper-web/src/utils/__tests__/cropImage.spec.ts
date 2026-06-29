import type { PixelCrop } from "react-image-crop";
import { cropImage, CropError } from "../cropImage";

function makeImg(naturalW: number, naturalH: number, renderedW = naturalW, renderedH = naturalH): HTMLImageElement {
    const img = new Image();
    Object.defineProperty(img, "naturalWidth", { value: naturalW });
    Object.defineProperty(img, "naturalHeight", { value: naturalH });
    Object.defineProperty(img, "width", { value: renderedW });
    Object.defineProperty(img, "height", { value: renderedH });
    return img;
}

const baseCrop: PixelCrop = { unit: "px", x: 10, y: 20, width: 100, height: 80 };

describe("cropImage", () => {
    test("rejects when the image element has zero natural width", async () => {
        const img = makeImg(0, 0);
        await expect(
            cropImage({
                image: img,
                pixelCrop: baseCrop,
                zoom: 1,
                outputFormat: "png",
                outputQuality: 1,
                outputSize: "original",
                cropShape: "rect",
                viewportWidth: 300,
                viewportHeight: 300,
                grayscale: false
            })
        ).rejects.toBeInstanceOf(CropError);
    });

    test("returns a File whose name has a .png extension when outputFormat is png", async () => {
        const img = makeImg(1000, 800);
        const file = await cropImage({
            image: img,
            pixelCrop: baseCrop,
            zoom: 1,
            outputFormat: "png",
            outputQuality: 1,
            outputSize: "original",
            cropShape: "rect",
            viewportWidth: 300,
            viewportHeight: 300,
            grayscale: false
        });
        expect(file.name.endsWith(".png")).toBe(true);
        expect(file.type).toBe("image/png");
    });

    test("returns a File whose name has a .jpg extension when outputFormat is jpeg", async () => {
        const img = makeImg(1000, 800);
        const file = await cropImage({
            image: img,
            pixelCrop: baseCrop,
            zoom: 1,
            outputFormat: "jpeg",
            outputQuality: 0.7,
            outputSize: "original",
            cropShape: "rect",
            viewportWidth: 300,
            viewportHeight: 300,
            grayscale: false
        });
        expect(file.name.endsWith(".jpg")).toBe(true);
        expect(file.type).toBe("image/jpeg");
    });

    test("uses viewport dims as canvas size when outputSize is viewport", async () => {
        const img = makeImg(1000, 800);
        const calls = await captureDrawImageCalls(() =>
            cropImage({
                image: img,
                pixelCrop: baseCrop,
                zoom: 1,
                outputFormat: "png",
                outputQuality: 1,
                outputSize: "viewport",
                cropShape: "rect",
                viewportWidth: 50,
                viewportHeight: 40,
                grayscale: false
            })
        );
        const ctx = calls[0].ctx as CanvasRenderingContext2D;
        expect(ctx.canvas.width).toBe(50);
        expect(ctx.canvas.height).toBe(40);
    });

    test("drawImage dest starts at top-left (no center-translate)", async () => {
        const img = makeImg(1000, 800);
        const calls = await captureDrawImageCalls(() =>
            cropImage({
                image: img,
                pixelCrop: baseCrop,
                zoom: 1,
                outputFormat: "png",
                outputQuality: 1,
                outputSize: "original",
                cropShape: "rect",
                viewportWidth: 300,
                viewportHeight: 300,
                grayscale: false
            })
        );
        // dest top-left must be (0, 0) — no rotation translate
        const [, , , , , dx, dy] = calls[0];
        expect(dx).toBe(0);
        expect(dy).toBe(0);
    });

    test("divides source rect by zoom factor when zoom > 1", async () => {
        const img = makeImg(1000, 800, 1000, 800);
        const calls = await captureDrawImageCalls(() =>
            cropImage({
                image: img,
                pixelCrop: { unit: "px", x: 100, y: 100, width: 200, height: 200 },
                zoom: 2,
                outputFormat: "png",
                outputQuality: 1,
                outputSize: "original",
                cropShape: "rect",
                viewportWidth: 300,
                viewportHeight: 300,
                grayscale: false
            })
        );
        const [, sx, sy, sw, sh] = calls[0];
        expect(sx).toBe(50);
        expect(sy).toBe(50);
        expect(sw).toBe(100);
        expect(sh).toBe(100);
    });

    test("returns a valid File when cropShape is circle", async () => {
        const img = makeImg(1000, 800);
        const file = await cropImage({
            image: img,
            pixelCrop: baseCrop,
            zoom: 1,
            outputFormat: "png",
            outputQuality: 1,
            outputSize: "original",
            cropShape: "circle",
            viewportWidth: 300,
            viewportHeight: 300,
            grayscale: false
        });
        expect(file).toBeInstanceOf(File);
        expect(file.name.endsWith(".png")).toBe(true);
    });

    test("rejects with CropError when toBlob returns null (tainted canvas)", async () => {
        const img = makeImg(1000, 800);
        const originalToBlob = HTMLCanvasElement.prototype.toBlob;
        HTMLCanvasElement.prototype.toBlob = function (cb: (b: Blob | null) => void) {
            cb(null);
        };
        try {
            await expect(
                cropImage({
                    image: img,
                    pixelCrop: baseCrop,
                    zoom: 1,
                    outputFormat: "png",
                    outputQuality: 1,
                    outputSize: "original",
                    cropShape: "rect",
                    viewportWidth: 300,
                    viewportHeight: 300,
                    grayscale: false
                })
            ).rejects.toBeInstanceOf(CropError);
        } finally {
            HTMLCanvasElement.prototype.toBlob = originalToBlob;
        }
    });

    test("grayscale option produces a File without throwing under canvas mock", async () => {
        const img = makeImg(1000, 800);
        const file = await cropImage({
            image: img,
            pixelCrop: baseCrop,
            zoom: 1,
            outputFormat: "png",
            outputQuality: 1,
            outputSize: "original",
            cropShape: "rect",
            viewportWidth: 300,
            viewportHeight: 300,
            grayscale: true
        });
        expect(file).toBeInstanceOf(File);
    });
});

async function captureDrawImageCalls(
    fn: () => Promise<unknown>
): Promise<Array<{ args: any[]; ctx: CanvasRenderingContext2D } & any[]>> {
    const calls: any[] = [];
    const proto = CanvasRenderingContext2D.prototype as any;
    const original = proto.drawImage;
    proto.drawImage = function (this: CanvasRenderingContext2D, ...args: any[]) {
        const entry: any = [...args];
        entry.ctx = this;
        entry.args = args;
        calls.push(entry);
        return original?.apply(this, args);
    };
    try {
        await fn();
    } finally {
        proto.drawImage = original;
    }
    return calls;
}
