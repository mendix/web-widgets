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
    test("renders without throwing when rotated and grayscale (canvas mock)", () => {
        const { container } = render(
            <PreviewPane
                image={makeImage()}
                pixelCrop={crop}
                zoom={1}
                width={100}
                height={100}
                circle={false}
                rotation={90}
                grayscale
            />
        );
        expect(container.querySelector("canvas")).not.toBeNull();
    });
});
