import { render } from "@testing-library/react";
import type { PixelCrop } from "react-image-crop";
import { PreviewPane } from "../PreviewPane";

function makeImage(): HTMLImageElement {
    const img = new Image();
    Object.defineProperty(img, "naturalWidth", { value: 1000, configurable: true });
    Object.defineProperty(img, "naturalHeight", { value: 800, configurable: true });
    Object.defineProperty(img, "width", { value: 400, configurable: true });
    Object.defineProperty(img, "height", { value: 320, configurable: true });
    return img;
}
const crop: PixelCrop = { unit: "px", x: 10, y: 10, width: 100, height: 80 };

describe("<PreviewPane>", () => {
    test("renders without throwing when grayscale (canvas mock)", () => {
        const { container } = render(
            <PreviewPane
                image={makeImage()}
                pixelCrop={crop}
                zoom={1}
                width={100}
                height={100}
                circle={false}
                grayscale
            />
        );
        expect(container.querySelector("canvas")).not.toBeNull();
    });

    test("draws with the box-center source rect (matches cropImage) at zoom > 1", () => {
        const proto = CanvasRenderingContext2D.prototype as unknown as {
            drawImage: (...args: unknown[]) => void;
        };
        const original = proto.drawImage;
        const calls: unknown[][] = [];
        proto.drawImage = function (...args: unknown[]) {
            calls.push(args);
        };
        try {
            // natural 1000x800, rendered 400x320 → scaleX=2.5, scaleY=2.5.
            // anchor == box center: (100+100/2)/400=0.375, (100+100/2)/320=0.46875 → natural (375,375).
            // z=2 → sw=sh=(100/2)*2.5=125; sx=sy=375-125/2=312.5.
            render(
                <PreviewPane
                    image={makeImage()}
                    pixelCrop={{ unit: "px", x: 100, y: 100, width: 100, height: 100 }}
                    zoom={2}
                    zoomAnchor={{ x: 0.375, y: 0.46875 }}
                    width={100}
                    height={100}
                    circle={false}
                    grayscale={false}
                />
            );
            const [, sx, sy, sw, sh] = calls[0] as number[];
            expect(sw).toBeCloseTo(125, 5);
            expect(sh).toBeCloseTo(125, 5);
            expect(sx).toBeCloseTo(312.5, 5);
            expect(sy).toBeCloseTo(312.5, 5);
        } finally {
            proto.drawImage = original;
        }
    });
});
