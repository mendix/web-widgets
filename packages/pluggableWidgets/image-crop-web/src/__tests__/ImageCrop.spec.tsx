import { ValueStatus } from "mendix";
import { render, screen } from "@testing-library/react";
import { ImageCrop } from "../ImageCrop";
import type { ImageCropContainerProps } from "../../typings/ImageCropProps";

function makeImageProp(overrides: Partial<any> = {}): any {
    return {
        status: ValueStatus.Available,
        value: { uri: "http://localhost/img.png" },
        readOnly: false,
        validation: undefined,
        setValidator: jest.fn(),
        setValue: jest.fn(),
        setThumbnailSize: jest.fn(),
        ...overrides
    };
}

function makeProps(overrides: Partial<ImageCropContainerProps> = {}): ImageCropContainerProps {
    const base: any = {
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
        minZoom: 1,
        maxZoom: 4,
        showPreview: false,
        previewWidth: 100,
        previewHeight: 100,
        outputFormat: "png",
        outputQuality: 0.92,
        outputSize: "original",
        cropButtonCaption: { value: "Crop", status: ValueStatus.Available },
        onCropAction: { canExecute: true, execute: jest.fn(), isExecuting: false }
    };
    return { ...base, ...overrides } as ImageCropContainerProps;
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

    test("Crop button is disabled until a completedCrop exists", () => {
        const props = makeProps();
        const { container } = render(<ImageCrop {...props} />);
        const btn = container.querySelector("button.widget-image-crop__button");
        expect(btn).not.toBeNull();
        expect(btn).toBeDisabled();
    });
});
