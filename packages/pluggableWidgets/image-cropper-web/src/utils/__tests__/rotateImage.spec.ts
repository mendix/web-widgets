import { CropError } from "../cropImage";
import { rotateImage, RotateImageOptions } from "../rotateImage";

function makeImg(naturalW: number, naturalH: number): HTMLImageElement {
    const img = new Image();
    Object.defineProperty(img, "naturalWidth", { value: naturalW });
    Object.defineProperty(img, "naturalHeight", { value: naturalH });
    Object.defineProperty(img, "width", { value: naturalW });
    Object.defineProperty(img, "height", { value: naturalH });
    return img;
}

const baseOpts: Omit<RotateImageOptions, "image" | "rotation"> = {
    outputFormat: "png",
    outputQuality: 1,
    originalName: "photo.png"
};

describe("rotateImage", () => {
    test("rejects with CropError when image has zero natural width", async () => {
        const img = makeImg(0, 0);
        await expect(rotateImage({ ...baseOpts, image: img, rotation: 90 })).rejects.toBeInstanceOf(CropError);
    });

    test("swaps canvas dimensions for 90° rotation (1000x800 → 800x1000)", async () => {
        const img = makeImg(1000, 800);
        const spy = jest.spyOn(document, "createElement");
        const file = await rotateImage({ ...baseOpts, image: img, rotation: 90 });
        const canvas = spy.mock.results.map(r => r.value).find(el => el?.tagName === "CANVAS") as HTMLCanvasElement;
        expect(canvas.width).toBe(800);
        expect(canvas.height).toBe(1000);
        expect(file).toBeInstanceOf(File);
        spy.mockRestore();
    });

    test("keeps canvas dimensions for 180° rotation (1000x800 → 1000x800)", async () => {
        const img = makeImg(1000, 800);
        const spy = jest.spyOn(document, "createElement");
        await rotateImage({ ...baseOpts, image: img, rotation: 180 });
        const canvas = spy.mock.results.map(r => r.value).find(el => el?.tagName === "CANVAS") as HTMLCanvasElement;
        expect(canvas.width).toBe(1000);
        expect(canvas.height).toBe(800);
        spy.mockRestore();
    });

    test("drawImage receives full source rect centered (1000x800, rotation 90)", async () => {
        const img = makeImg(1000, 800);
        const calls = await captureDrawImageCalls(() => rotateImage({ ...baseOpts, image: img, rotation: 90 }));
        // centered: dest top-left at (-nw/2, -nh/2) = (-500, -400); size = natural (1000, 800)
        const [drawImg, sx, sy, sw, sh, dx, dy, dw, dh] = calls[0];
        expect(drawImg).toBe(img);
        expect(sx).toBe(0);
        expect(sy).toBe(0);
        expect(sw).toBe(1000);
        expect(sh).toBe(800);
        expect(dx).toBe(-500);
        expect(dy).toBe(-400);
        expect(dw).toBe(1000);
        expect(dh).toBe(800);
    });

    test("returns a .png File for png outputFormat", async () => {
        const img = makeImg(1000, 800);
        const file = await rotateImage({ ...baseOpts, image: img, rotation: 90, outputFormat: "png" });
        expect(file.name.endsWith(".png")).toBe(true);
        expect(file.type).toBe("image/png");
    });

    test("returns a .jpg File for jpeg outputFormat", async () => {
        const img = makeImg(1000, 800);
        const file = await rotateImage({
            ...baseOpts,
            image: img,
            rotation: 90,
            outputFormat: "jpeg",
            outputQuality: 0.8,
            originalName: "photo.jpg"
        });
        expect(file.name.endsWith(".jpg")).toBe(true);
        expect(file.type).toBe("image/jpeg");
    });

    test("rejects with CropError when toBlob returns null (tainted canvas)", async () => {
        const img = makeImg(1000, 800);
        const originalToBlob = HTMLCanvasElement.prototype.toBlob;
        HTMLCanvasElement.prototype.toBlob = function (cb: (b: Blob | null) => void) {
            cb(null);
        };
        try {
            await expect(rotateImage({ ...baseOpts, image: img, rotation: 90 })).rejects.toBeInstanceOf(CropError);
        } finally {
            HTMLCanvasElement.prototype.toBlob = originalToBlob;
        }
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
