import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ReactElement } from "react";
import { DialogStyleEnum } from "../../../../../typings/RichTextProps";
import { EditorContext, ImageDialogConfig } from "../../../EditorContext";
import { ImageDialog } from "../ImageDialog";

function renderWithConfig(imageConfig: ImageDialogConfig): ReturnType<typeof render> {
    return render(
        <EditorContext.Provider
            value={{
                editor: null,
                codeViewState: { isCodeView: false, htmlCode: "", showConfirm: false },
                codeViewDispatch: () => undefined,
                dialogStyle: "inline",
                imageConfig
            }}
        >
            {(<ImageDialog onClose={() => undefined} referenceElement={null} />) as ReactElement}
        </EditorContext.Provider>
    );
}

describe("ImageDialog tab visibility", () => {
    it("always renders the URL tab", () => {
        renderWithConfig({ enableDefaultUpload: true, hasImageSource: true });

        expect(screen.getByRole("button", { name: "URL" })).toBeInTheDocument();
    });

    it("hides the Entity tab when no image source is configured", () => {
        renderWithConfig({ enableDefaultUpload: true, hasImageSource: false });

        expect(screen.getByRole("button", { name: "URL" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Media Library" })).not.toBeInTheDocument();
    });

    it("hides the Upload tab when default upload is disabled", () => {
        renderWithConfig({ enableDefaultUpload: false, hasImageSource: true });

        expect(screen.getByRole("button", { name: "URL" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Media Library" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Upload" })).not.toBeInTheDocument();
    });

    it("renders all tabs when image source is configured and default upload is enabled", () => {
        renderWithConfig({ enableDefaultUpload: true, hasImageSource: true });

        expect(screen.getByRole("button", { name: "URL" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Media Library" })).toBeInTheDocument();
    });
});

describe("ImageDialog dimensions", () => {
    function renderWithEditor(): { setImage: jest.Mock } {
        const setImage = jest.fn();
        const chain = {
            focus: () => chain,
            setImage: (attrs: Record<string, unknown>) => {
                setImage(attrs);
                return chain;
            },
            run: () => true
        };
        const editor = { chain: () => chain } as any;

        render(
            <EditorContext.Provider
                value={{
                    editor,
                    codeViewState: { isCodeView: false, htmlCode: "", showConfirm: false },
                    codeViewDispatch: () => undefined,
                    dialogStyle: "inline",
                    imageConfig: { enableDefaultUpload: false, hasImageSource: false }
                }}
            >
                {(<ImageDialog onClose={() => undefined} referenceElement={null} />) as ReactElement}
            </EditorContext.Provider>
        );

        return { setImage };
    }

    const fillUrl = (): void => {
        fireEvent.change(screen.getByLabelText("Image URL"), {
            target: { value: "https://example.com/image.jpg" }
        });
    };

    const submit = (): void => {
        fireEvent.click(screen.getByRole("button", { name: "Insert" }));
    };

    it("applies width only and no height when aspect ratio is maintained", () => {
        const { setImage } = renderWithEditor();
        fillUrl();
        fireEvent.change(screen.getByLabelText("Width (px)"), { target: { value: "300" } });
        submit();

        expect(setImage).toHaveBeenCalledTimes(1);
        const attrs = setImage.mock.calls[0][0];
        expect(attrs.width).toBe("300px");
        expect(attrs.height).toBeUndefined();
    });

    it("disables the Height input while maintain aspect ratio is checked", () => {
        renderWithEditor();

        expect(screen.getByLabelText("Height (px)")).toBeDisabled();
    });

    it("applies both width and height when aspect ratio is not maintained", () => {
        const { setImage } = renderWithEditor();
        fillUrl();
        fireEvent.click(screen.getByLabelText("Maintain aspect ratio"));
        fireEvent.change(screen.getByLabelText("Width (px)"), { target: { value: "300" } });
        fireEvent.change(screen.getByLabelText("Height (px)"), { target: { value: "200" } });
        submit();

        const attrs = setImage.mock.calls[0][0];
        expect(attrs.width).toBe("300px");
        expect(attrs.height).toBe("200px");
    });

    it("ignores non-positive width values", () => {
        const { setImage } = renderWithEditor();
        fillUrl();
        fireEvent.change(screen.getByLabelText("Width (px)"), { target: { value: "0" } });
        submit();

        const attrs = setImage.mock.calls[0][0];
        expect(attrs.width).toBeUndefined();
    });

    it("preserves an entered height value when toggling the ratio checkbox", () => {
        renderWithEditor();
        const checkbox = screen.getByLabelText("Maintain aspect ratio");

        fireEvent.click(checkbox); // uncheck -> height enabled
        fireEvent.change(screen.getByLabelText("Height (px)"), { target: { value: "200" } });
        fireEvent.click(checkbox); // check -> height disabled
        fireEvent.click(checkbox); // uncheck -> height enabled again

        expect(screen.getByLabelText("Height (px)")).toHaveValue(200);
    });
});

describe("ImageDialog insertion isolation", () => {
    // A widget placed in the image-source content slot may render a <button> without an explicit
    // type. Such a button is a submit button, so the dialog must not expose a form owner to it.
    const EMBEDDED_BUTTON_LABEL = "Embedded add";

    function renderWithEmbeddedContent(): {
        setImage: jest.Mock;
        onClose: jest.Mock;
    } {
        const setImage = jest.fn();
        const onClose = jest.fn();
        const chain = {
            focus: () => chain,
            setImage: (attrs: Record<string, unknown>) => {
                setImage(attrs);
                return chain;
            },
            run: () => true
        };
        const editor = { chain: () => chain } as any;

        render(
            <EditorContext.Provider
                value={{
                    editor,
                    codeViewState: { isCodeView: false, htmlCode: "", showConfirm: false },
                    codeViewDispatch: () => undefined,
                    dialogStyle: "inline",
                    imageConfig: {
                        enableDefaultUpload: false,
                        hasImageSource: true,
                        // No `type` attribute — this is the shape that caused the bug.
                        imageSourceContent: <button>{EMBEDDED_BUTTON_LABEL}</button>
                    }
                }}
            >
                {(<ImageDialog onClose={onClose} referenceElement={null} />) as ReactElement}
            </EditorContext.Provider>
        );

        fireEvent.click(screen.getByRole("button", { name: "Media Library" }));

        return { setImage, onClose };
    }

    // The dialog is portalled to the body, so it is not inside `render`'s container.
    const selectEntityImage = (): void => {
        const dialog = document.querySelector(".image-dialog") as HTMLElement;
        act(() => {
            dialog.dispatchEvent(
                new CustomEvent("imageSelected", {
                    detail: { id: "id-1234-5678", url: "https://example.com/entity.jpg" }
                })
            );
        });
    };

    it("renders no form element", () => {
        renderWithEmbeddedContent();

        // Portalled, so this looks at the whole document rather than the render container.
        expect(document.querySelector(".image-dialog form")).toBeNull();
    });

    it("does not insert or close when an untyped embedded button is clicked", () => {
        const { setImage, onClose } = renderWithEmbeddedContent();

        fireEvent.click(screen.getByRole("button", { name: EMBEDDED_BUTTON_LABEL }));

        expect(setImage).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("does not insert or close when an untyped embedded button is clicked after an image is selected", () => {
        const { setImage, onClose } = renderWithEmbeddedContent();
        const embedded = screen.getByRole("button", { name: EMBEDDED_BUTTON_LABEL });

        fireEvent.click(embedded);
        selectEntityImage();
        fireEvent.click(embedded);
        fireEvent.click(embedded);

        expect(setImage).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("does not insert when Enter is pressed inside embedded content", () => {
        const { setImage, onClose } = renderWithEmbeddedContent();
        selectEntityImage();

        fireEvent.keyDown(screen.getByRole("button", { name: EMBEDDED_BUTTON_LABEL }), { key: "Enter" });

        expect(setImage).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("inserts the selected entity image when the Insert button is activated", () => {
        const { setImage, onClose } = renderWithEmbeddedContent();
        selectEntityImage();

        fireEvent.click(screen.getByRole("button", { name: "Insert" }));

        expect(setImage).toHaveBeenCalledTimes(1);
        const attrs = setImage.mock.calls[0][0];
        expect(attrs.src).toBe("https://example.com/entity.jpg");
        expect(attrs.dataEntity).toBe(true);
        expect(attrs.dataEntityId).toBe("id-1234-5678");
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});

describe("ImageDialog Enter to insert", () => {
    function renderWithEditor(): { setImage: jest.Mock; onClose: jest.Mock } {
        const setImage = jest.fn();
        const onClose = jest.fn();
        const chain = {
            focus: () => chain,
            setImage: (attrs: Record<string, unknown>) => {
                setImage(attrs);
                return chain;
            },
            run: () => true
        };
        const editor = { chain: () => chain } as any;

        render(
            <EditorContext.Provider
                value={{
                    editor,
                    codeViewState: { isCodeView: false, htmlCode: "", showConfirm: false },
                    codeViewDispatch: () => undefined,
                    dialogStyle: "inline",
                    imageConfig: { enableDefaultUpload: false, hasImageSource: false }
                }}
            >
                {(<ImageDialog onClose={onClose} referenceElement={null} />) as ReactElement}
            </EditorContext.Provider>
        );

        return { setImage, onClose };
    }

    const fillUrl = (): void => {
        fireEvent.change(screen.getByLabelText("Image URL"), {
            target: { value: "https://example.com/image.jpg" }
        });
    };

    it.each(["Image URL", "Alt text (optional)", "Title (optional)", "Width (px)"])(
        "inserts on Enter in the %s input",
        label => {
            const { setImage, onClose } = renderWithEditor();
            fillUrl();

            fireEvent.keyDown(screen.getByLabelText(label), { key: "Enter" });

            expect(setImage).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        }
    );

    it("inserts on Enter in the Height input", () => {
        const { setImage, onClose } = renderWithEditor();
        fillUrl();
        fireEvent.click(screen.getByLabelText("Maintain aspect ratio")); // enables Height

        fireEvent.keyDown(screen.getByLabelText("Height (px)"), { key: "Enter" });

        expect(setImage).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not insert on Enter while the image source is empty", () => {
        const { setImage, onClose } = renderWithEditor();

        fireEvent.keyDown(screen.getByLabelText("Image URL"), { key: "Enter" });

        expect(setImage).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("ignores keys other than Enter", () => {
        const { setImage } = renderWithEditor();
        fillUrl();

        fireEvent.keyDown(screen.getByLabelText("Image URL"), { key: "a" });

        expect(setImage).not.toHaveBeenCalled();
    });
});

// A Media Library listing many images used to grow the dialog past the viewport and push Insert /
// Cancel out of reach. The tall content now lives in a bounded scroll region instead.
describe("ImageDialog scroll region", () => {
    function renderWithTallImageSource(dialogStyle: DialogStyleEnum): void {
        render(
            <EditorContext.Provider
                value={{
                    editor: null,
                    codeViewState: { isCodeView: false, htmlCode: "", showConfirm: false },
                    codeViewDispatch: () => undefined,
                    dialogStyle,
                    imageConfig: {
                        enableDefaultUpload: false,
                        hasImageSource: true,
                        imageSourceContent: (
                            <ul>
                                {Array.from({ length: 60 }, (_, index) => (
                                    <li key={index}>Image {index}</li>
                                ))}
                            </ul>
                        )
                    }
                }}
            >
                {(<ImageDialog onClose={() => undefined} referenceElement={null} />) as ReactElement}
            </EditorContext.Provider>
        );

        fireEvent.click(screen.getByRole("button", { name: "Media Library" }));
    }

    it("keeps the tall image source inside the scroll region and the actions outside it", () => {
        renderWithTallImageSource("inline");

        const scroll = document.querySelector(".dialog-scroll") as HTMLElement;
        const actions = document.querySelector(".dialog-actions") as HTMLElement;

        expect(scroll).not.toBeNull();
        expect(scroll.querySelector(".image-dialog-entity")).not.toBeNull();
        expect(scroll.contains(actions)).toBe(false);
        expect(document.querySelector(".dialog-scroll h3")).toBeNull();
    });

    it("bounds the dialog height in focused mode", () => {
        renderWithTallImageSource("focused");

        expect(screen.getByRole("dialog")).toHaveStyle({ maxHeight: "70vh" });
    });

    it("bounds the dialog height in inline mode", () => {
        renderWithTallImageSource("inline");

        // With no anchor to measure against, the shell falls back to its default bound rather than
        // leaving the dialog unbounded.
        expect(document.querySelector(".toolbar-dialog")).toHaveStyle({ maxHeight: "70vh" });
    });
});
