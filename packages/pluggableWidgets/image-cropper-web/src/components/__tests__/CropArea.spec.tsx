import { render } from "@testing-library/react";
import { createRef } from "react";
import { CropArea, type CropAreaProps } from "../CropArea";

function baseProps(overrides: Partial<CropAreaProps> = {}): CropAreaProps {
    return {
        src: "http://localhost/img.png",
        crop: undefined,
        onCropChange: jest.fn(),
        onCropComplete: jest.fn(),
        aspect: undefined,
        circular: false,
        resizable: true,
        boundaryWidth: 300,
        boundaryHeight: 300,
        onImageLoad: jest.fn(),
        zoom: 1,
        zoomAnchor: { x: 0.5, y: 0.5 },
        minZoom: 1,
        maxZoom: 4,
        setZoom: jest.fn(),
        wheelZoomMode: "off" as const,
        grayscale: true,
        imageRef: createRef<HTMLImageElement>(),
        ...overrides
    };
}

describe("<CropArea>", () => {
    test("applies zoom scale and grayscale filter to the image (no CSS rotation)", () => {
        const { container } = render(<CropArea {...baseProps()} />);
        const img = container.querySelector("img")!;
        expect(img.style.transform).toContain("scale(1)");
        expect(img.style.transform).not.toContain("rotate(");
        expect(img.style.filter).toContain("grayscale(1)");
    });

    test("no grayscale filter when grayscale is false", () => {
        const { container } = render(<CropArea {...baseProps({ grayscale: false })} />);
        const img = container.querySelector("img")!;
        expect(img.style.filter === "" || img.style.filter === "none").toBe(true);
    });

    test("transformOrigin follows the zoomAnchor prop (fractions → percent)", () => {
        const { container } = render(<CropArea {...baseProps({ zoomAnchor: { x: 0.3, y: 0.35 } })} />);
        const img = container.querySelector("img")!;
        expect(img.style.transformOrigin).toBe("30% 35%");
    });

    test("transformOrigin ignores box movement (stays on the frozen anchor)", () => {
        // The image must stay stable while the box moves: origin depends ONLY on zoomAnchor,
        // NOT on the live crop. Moving the crop with the same anchor keeps the origin fixed.
        const anchor = { x: 0.5, y: 0.5 };
        const { container, rerender } = render(
            <CropArea {...baseProps({ zoomAnchor: anchor, crop: { unit: "%", x: 0, y: 0, width: 20, height: 20 } })} />
        );
        const img = container.querySelector("img")!;
        expect(img.style.transformOrigin).toBe("50% 50%");
        rerender(
            <CropArea
                {...baseProps({ zoomAnchor: anchor, crop: { unit: "%", x: 60, y: 70, width: 20, height: 20 } })}
            />
        );
        expect(img.style.transformOrigin).toBe("50% 50%");
    });
});
