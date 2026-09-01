import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ReactElement } from "react";
import { EditorContext, ImageDialogConfig } from "../../../EditorContext";
import { ImageDialog } from "../ImageDialog";

function renderWithConfig(imageConfig: ImageDialogConfig): ReturnType<typeof render> {
    return render(
        <EditorContext.Provider
            value={{
                editor: null,
                codeViewState: { isCodeView: false, htmlCode: "", showConfirm: false },
                codeViewDispatch: () => undefined,
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
        container: HTMLElement;
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

        const { container } = render(
            <EditorContext.Provider
                value={{
                    editor,
                    codeViewState: { isCodeView: false, htmlCode: "", showConfirm: false },
                    codeViewDispatch: () => undefined,
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

        return { setImage, onClose, container };
    }

    const selectEntityImage = (container: HTMLElement): void => {
        const dialog = container.querySelector(".image-dialog") as HTMLElement;
        act(() => {
            dialog.dispatchEvent(
                new CustomEvent("imageSelected", {
                    detail: { id: "id-1234-5678", url: "https://example.com/entity.jpg" }
                })
            );
        });
    };

    it("renders no form element", () => {
        const { container } = renderWithEmbeddedContent();

        expect(container.querySelector("form")).toBeNull();
    });

    it("does not insert or close when an untyped embedded button is clicked", () => {
        const { setImage, onClose } = renderWithEmbeddedContent();

        fireEvent.click(screen.getByRole("button", { name: EMBEDDED_BUTTON_LABEL }));

        expect(setImage).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("does not insert or close when an untyped embedded button is clicked after an image is selected", () => {
        const { setImage, onClose, container } = renderWithEmbeddedContent();
        const embedded = screen.getByRole("button", { name: EMBEDDED_BUTTON_LABEL });

        fireEvent.click(embedded);
        selectEntityImage(container);
        fireEvent.click(embedded);
        fireEvent.click(embedded);

        expect(setImage).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("does not insert when Enter is pressed inside embedded content", () => {
        const { setImage, onClose, container } = renderWithEmbeddedContent();
        selectEntityImage(container);

        fireEvent.keyDown(screen.getByRole("button", { name: EMBEDDED_BUTTON_LABEL }), { key: "Enter" });

        expect(setImage).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("inserts the selected entity image when the Insert button is activated", () => {
        const { setImage, onClose, container } = renderWithEmbeddedContent();
        selectEntityImage(container);

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
