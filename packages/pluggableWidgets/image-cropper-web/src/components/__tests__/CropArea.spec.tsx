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
});
