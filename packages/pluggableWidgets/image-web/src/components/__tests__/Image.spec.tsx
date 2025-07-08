import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { createElement, forwardRef } from "react";
import { ModalProps } from "react-overlays/esm/Modal";
import { Image, ImageProps } from "../Image/Image";

jest.mock("../../assets/ic24-close.svg", () => "close-button-icon-svg");

jest.mock("react-overlays/Modal", () =>
    forwardRef((props: ModalProps, ref) => {
        if (!props.show) return null;
        const MockName = "react-overlays-modal-mock";
        // The backdrop is rendered somewhere else in a portal, but for testing sake we put it here since we also mock.
        const BackdropMockName = "react-overlays-modal-backdrop-mock";
        return (
            // @ts-expect-error lower case custom name to make clear it's a mock
            <MockName {...props} ref={ref}>
                {props.children}
                {/* @ts-expect-error lower case custom name to make clear it's a mock */}
                <BackdropMockName>{props.renderBackdrop?.({ onClick: jest.fn(), ref: jest.fn() })}</BackdropMockName>
            </MockName>
        );
    })
);

const imageProps: ImageProps = {
    class: "",
    type: "image",
    image: "https://pbs.twimg.com/profile_images/1905729715/llamas_1_.jpg",
    height: 300,
    heightUnit: "pixels",
    width: 300,
    widthUnit: "pixels",
    iconSize: 0,
    responsive: true,
    onClickType: "action",
    displayAs: "fullImage",
    renderAsBackground: false,
    backgroundImageContent: null
};

const glyphiconProps: ImageProps = {
    class: "",
    type: "glyph",
    image: "glyphicon-asterisk",
    iconSize: 20,
    height: 0,
    heightUnit: "pixels",
    width: 0,
    widthUnit: "pixels",
    responsive: true,
    onClickType: "action",
    displayAs: "fullImage",
    renderAsBackground: false,
    backgroundImageContent: null
};

const iconProps: ImageProps = {
    class: "",
    type: "icon",
    image: "mx-icon mx-icon-asterisk",
    iconSize: 20,
    height: 0,
    heightUnit: "pixels",
    width: 0,
    widthUnit: "pixels",
    responsive: true,
    onClickType: "action",
    displayAs: "fullImage",
    renderAsBackground: false,
    backgroundImageContent: null
};

describe("Image", () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    it("renders the structure with an image", () => {
        const image = render(<Image {...imageProps} />);
        expect(image.asFragment()).toMatchSnapshot();
    });

    it("renders the structure with an image and percentage dimensions", () => {
        const image = render(
            <Image {...imageProps} height={100} width={100} heightUnit="auto" widthUnit="percentage" />
        );
        expect(image.asFragment()).toMatchSnapshot();
    });

    it("renders the structure with a glyph icon", () => {
        const image = render(<Image {...glyphiconProps} />);
        expect(image.asFragment()).toMatchSnapshot();
    });

    it("renders the structure with an icon", () => {
        const image = render(<Image {...iconProps} />);
        expect(image.asFragment()).toMatchSnapshot();
    });

    it("renders the structure as a background image", () => {
        const image = render(
            <Image {...imageProps} renderAsBackground backgroundImageContent={<div>Image content</div>} />
        );
        expect(image.asFragment()).toMatchSnapshot();
    });

    describe("when the onClickType is action", () => {
        it("calls the onClick when clicking on an image", async () => {
            const onClickMock = jest.fn();
            const { getByRole } = render(<Image {...imageProps} onClick={onClickMock} onClickType="action" />);
            const image = getByRole("button");
            expect(image).toBeInTheDocument();
            await user.click(image);
            expect(onClickMock).toHaveBeenCalled();
        });

        it("has tabindex if there is an action with OnClick", () => {
            const onClickMock = jest.fn();
            const { getByRole } = render(
                <Image {...imageProps} onClick={onClickMock} onClickType="action" tabIndex={1} />
            );
            const image = getByRole("button");
            expect(image.tabIndex).toBe(1);
        });

        it("has no tabindex if there is no action with OnClick", () => {
            const { getByRole } = render(<Image {...imageProps} />);
            const image = getByRole("img");
            expect(image.tabIndex).toBe(-1);
        });

        it("calls the onClick when clicking on a glyph icon", async () => {
            const onClickMock = jest.fn();
            const { getByRole } = render(<Image {...glyphiconProps} onClick={onClickMock} onClickType="action" />);
            const icon = getByRole("button");
            expect(icon).toBeInTheDocument();
            await user.click(icon);
            expect(onClickMock).toHaveBeenCalled();
        });

        it("calls the onClick when clicking on an icon", async () => {
            const onClickMock = jest.fn();
            const { getByRole } = render(<Image {...iconProps} onClick={onClickMock} onClickType="action" />);
            const icon = getByRole("button");
            expect(icon).toBeInTheDocument();
            await user.click(icon);
            expect(onClickMock).toHaveBeenCalled();
        });
    });

    describe("when the onClickType is enlarge", () => {
        it("shows a lightbox when the user clicks on the image", async () => {
            const { container, getByRole } = render(<Image {...imageProps} onClickType="enlarge" />);
            expect(container.querySelector(".mx-image-viewer-lightbox")).not.toBeInTheDocument();
            const image = getByRole("button");
            expect(image).toBeInTheDocument();
            await userEvent.click(image);
            const lightbox = container.querySelector(".mx-image-viewer-lightbox-backdrop");
            expect(lightbox).toBeInTheDocument();
        });

        it("closes the lightbox when the user clicks on the close button after opening it", async () => {
            const { container, getByRole } = render(<Image {...imageProps} onClickType="enlarge" />);
            const image = getByRole("button");
            expect(image).toBeInTheDocument();
            await userEvent.click(image);
            const lightbox = container.querySelector(".mx-image-viewer-lightbox-backdrop");
            expect(lightbox).toBeInTheDocument();
            const closeButton = container.querySelector(".close-button");
            expect(closeButton).toBeInTheDocument();
            await userEvent.click(closeButton!);
            expect(lightbox).not.toBeInTheDocument();
        });
    });

    it("does not trigger on clicks from containers if clicked on the image", async () => {
        const onClickOuterMock = jest.fn();
        const onClickImageMock = jest.fn();
        const { getByRole } = render(
            <div onClick={onClickOuterMock}>
                <Image {...imageProps} onClickType="action" onClick={onClickImageMock} />
            </div>
        );
        const image = getByRole("button");
        expect(image).toBeInTheDocument();
        await user.click(image);
        expect(onClickImageMock).toHaveBeenCalledTimes(1);
        expect(onClickOuterMock).not.toHaveBeenCalled();
    });

    describe("when there is an accessibility alt text", () => {
        it("is set properly on an image", () => {
            const { getByRole } = render(<Image {...imageProps} altText="this is an awesome image" />);
            const image = getByRole("img");
            expect(image).toHaveAttribute("alt", "this is an awesome image");
        });

        it("is set properly on a glyphicon", () => {
            const { getByRole } = render(<Image {...glyphiconProps} altText="this is an awesome glyphicon" />);
            const icon = getByRole("img");
            expect(icon).toHaveAttribute("aria-label", "this is an awesome glyphicon");
            expect(icon).toHaveAttribute("role", "img");
        });

        it("is set properly on an icon", () => {
            const { getByRole } = render(<Image {...iconProps} altText="this is an awesome icon" />);
            const icon = getByRole("img");
            expect(icon).toHaveAttribute("aria-label", "this is an awesome icon");
            expect(icon).toHaveAttribute("role", "img");
        });
    });

    describe("when there is no accessibility alt text", () => {
        it("nothing is set on an image", () => {
            const { getByRole } = render(<Image {...imageProps} />);
            const image = getByRole("img");
            expect(image).not.toHaveAttribute("alt");
        });

        it("nothing is set on a glyphicon", () => {
            const { getByRole } = render(<Image {...glyphiconProps} />);
            const icon = getByRole("img");
            expect(icon).not.toHaveAttribute("aria-label");
        });

        it("nothing is set on an icon", () => {
            const { getByRole } = render(<Image {...iconProps} />);
            const icon = getByRole("img");
            expect(icon).not.toHaveAttribute("aria-label");
        });
    });

    describe("when showing an image as a thumbnail", () => {
        it("includes the thumb=true URL param in the image", () => {
            const { getByRole } = render(<Image {...imageProps} displayAs="thumbnail" />);
            const image = getByRole("img") as HTMLImageElement;
            expect(image.src).toContain("thumb=true");
        });

        it("does not include the thumb=true URL param in the lightbox image", async () => {
            const { getByRole, getAllByRole } = render(
                <Image {...imageProps} displayAs="thumbnail" onClickType="enlarge" />
            );
            const image = getByRole("button") as HTMLImageElement;
            expect(image.src).toContain("thumb=true");
            await user.click(image);

            const allImages = getAllByRole("img") as HTMLImageElement[];
            expect(allImages.length).toBeGreaterThanOrEqual(2);
            expect(allImages[0].src).not.toContain("thumb=true");
            expect(allImages[1].src).not.toContain("thumb=true");
        });
    });

    describe("when showing as a background image", () => {
        it("shows the content", () => {
            const { getByText } = render(
                <Image {...imageProps} renderAsBackground backgroundImageContent={<div>Image content</div>} />
            );
            expect(getByText("Image content")).toBeInTheDocument();
        });

        it("properly handles on click event if configured by the user", async () => {
            const onClickMock = jest.fn();
            const { container } = render(
                <Image
                    {...imageProps}
                    renderAsBackground
                    backgroundImageContent={<div>Image content</div>}
                    onClick={onClickMock}
                    onClickType="action"
                />
            );
            const backgroundImage = container.querySelector(".mx-image-viewer.mx-image-background");
            expect(backgroundImage).toBeInTheDocument();
            await user.click(backgroundImage!);
            expect(onClickMock).toHaveBeenCalledTimes(1);
        });
    });
});
