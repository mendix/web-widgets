import { fireEvent, render, screen } from "@testing-library/react";
import { Big } from "big.js";
import { ValueStatus } from "mendix";
import { actionValue } from "@mendix/widget-plugin-test-utils";
import type { ImageCropContainerProps } from "../../typings/ImageCropProps";
import { ImageCrop } from "../ImageCrop";

type ImageProp = ImageCropContainerProps["image"];
type WebImage = NonNullable<ImageProp["value"]>;

function makeImageProp(overrides: Partial<ImageProp> = {}): ImageProp {
    return {
        status: ValueStatus.Available,
        value: { uri: "http://localhost/img.png", name: "img.png" } as WebImage,
        readOnly: false,
        validation: undefined,
        setValidator: jest.fn(),
        setValue: jest.fn(),
        setThumbnailSize: jest.fn(),
        ...overrides
    } as ImageProp;
}

function makeProps(overrides: Partial<ImageCropContainerProps> = {}): ImageCropContainerProps {
    return {
        name: "imageCrop",
        class: "",
        style: undefined,
        tabIndex: 0,
        image: makeImageProp(),
        cropShape: "rect",
        aspectRatio: "free",
        customAspectWidth: 1,
        customAspectHeight: 1,
        boundaryWidth: 300,
        boundaryHeight: 300,
        resizableEnabled: true,
        zoomEnabled: true,
        wheelZoomMode: "onWithCtrl",
        minZoom: new Big(1),
        maxZoom: new Big(4),
        showPreview: false,
        previewWidth: 100,
        previewHeight: 100,
        outputFormat: "png",
        outputQuality: new Big(0.92),
        outputSize: "original",
        cropButtonCaption: {
            value: "Crop",
            status: ValueStatus.Available
        } as ImageCropContainerProps["cropButtonCaption"],
        onCropAction: actionValue(),
        ...overrides
    };
}

describe("<ImageCrop>", () => {
    test("renders skeleton while image is loading", () => {
        const props = makeProps({ image: makeImageProp({ status: ValueStatus.Loading, value: undefined }) });
        const { container } = render(<ImageCrop {...props} />);
        expect(container.querySelector(".widget-image-crop--loading")).not.toBeNull();
    });

    test("renders empty state when image has no value", () => {
        const props = makeProps({ image: makeImageProp({ value: undefined }) });
        render(<ImageCrop {...props} />);
        expect(screen.getByText("No image")).toBeInTheDocument();
    });

    test("disables Crop button when image is read-only", () => {
        const props = makeProps({ image: makeImageProp({ readOnly: true }) });
        render(<ImageCrop {...props} />);
        const btn = screen.getByRole("button", { name: "Crop" });
        expect(btn).toBeDisabled();
    });

    test("Crop button is enabled after image loads (initial crop auto-set)", () => {
        const props = makeProps();
        const { container } = render(<ImageCrop {...props} />);
        const img = container.querySelector("img");
        expect(img).not.toBeNull();
        fireEvent.load(img!);
        const btn = container.querySelector("button.widget-image-crop__button");
        expect(btn).not.toBeNull();
        expect(btn).not.toBeDisabled();
    });

    test("before load, image is bounded by boundary as max-width/max-height ceiling", () => {
        const props = makeProps({ boundaryWidth: 800, boundaryHeight: 600 });
        const { container } = render(<ImageCrop {...props} />);
        const img = container.querySelector("img") as HTMLImageElement | null;
        expect(img).not.toBeNull();
        expect(img!.style.maxWidth).toBe("800px");
        expect(img!.style.maxHeight).toBe("600px");
    });

    test("after load, image gets fit-and-scaled pixel dims; canvas wraps via inline-block + ceiling", () => {
        const props = makeProps({ boundaryWidth: 800, boundaryHeight: 600 });
        const { container } = render(<ImageCrop {...props} />);
        const img = container.querySelector("img") as HTMLImageElement;
        Object.defineProperty(img, "naturalWidth", { value: 400, configurable: true });
        Object.defineProperty(img, "naturalHeight", { value: 300, configurable: true });
        fireEvent.load(img);
        const canvas = container.querySelector(".widget-image-crop__canvas") as HTMLDivElement;
        expect(img.style.width).toBe("800px");
        expect(img.style.height).toBe("600px");
        expect(canvas.style.maxWidth).toBe("800px");
        expect(canvas.style.maxHeight).toBe("600px");
    });

    test("crop is cleared between image src change and next load (button disabled)", () => {
        const props = makeProps({ image: makeImageProp({ value: { uri: "http://localhost/img1.png" } }) });
        const { container, rerender } = render(<ImageCrop {...props} />);
        const img1 = container.querySelector("img");
        fireEvent.load(img1!);
        expect(container.querySelector("button.widget-image-crop__button")).not.toBeDisabled();

        const newProps = makeProps({ image: makeImageProp({ value: { uri: "http://localhost/img2.png" } }) });
        rerender(<ImageCrop {...newProps} />);
        expect(container.querySelector("button.widget-image-crop__button")).toBeDisabled();

        const img2 = container.querySelector("img");
        fireEvent.load(img2!);
        expect(container.querySelector("button.widget-image-crop__button")).not.toBeDisabled();
    });
});
