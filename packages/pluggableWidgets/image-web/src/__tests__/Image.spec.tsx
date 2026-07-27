import { render } from "@testing-library/react";
import { editableImage } from "@mendix/widget-plugin-test-utils";
import { ImageContainerProps } from "../../typings/ImageProps";
import { Image } from "../Image";

function makeProps(overrides: Partial<ImageContainerProps> = {}): ImageContainerProps {
    return {
        name: "image1",
        class: "",
        style: undefined,
        tabIndex: 0,
        datasource: "image",
        isBackgroundImage: false,
        onClickType: "action",
        widthUnit: "auto",
        width: 100,
        heightUnit: "auto",
        height: 100,
        minHeightUnit: "none",
        minHeight: 0,
        maxHeightUnit: "none",
        maxHeight: 0,
        iconSize: 14,
        displayAs: "fullImage",
        responsive: true,
        ...overrides
    } as ImageContainerProps;
}

describe("Image container", () => {
    it("renders the bound image when imageObject is Available", () => {
        const { getByRole } = render(
            <Image {...makeProps({ imageObject: editableImage.with({ uri: "https://example.com/a.png" }) })} />
        );
        const image = getByRole("img") as HTMLImageElement;
        expect(image.src).toBe("https://example.com/a.png");
    });

    it("falls back to defaultImageDynamic when imageObject is Unavailable", () => {
        const { getByRole } = render(
            <Image
                {...makeProps({
                    imageObject: editableImage(b => b.isUnavailable().build()),
                    defaultImageDynamic: editableImage.with({ uri: "https://example.com/default.png" })
                })}
            />
        );
        const image = getByRole("img") as HTMLImageElement;
        expect(image.src).toBe("https://example.com/default.png");
    });

    it("renders no image src when both imageObject and defaultImageDynamic are unavailable", () => {
        const { container } = render(
            <Image
                {...makeProps({
                    imageObject: editableImage(b => b.isUnavailable().build())
                })}
            />
        );
        const image = container.querySelector("img");
        expect(image?.getAttribute("src")).toBeFalsy();
    });
});
