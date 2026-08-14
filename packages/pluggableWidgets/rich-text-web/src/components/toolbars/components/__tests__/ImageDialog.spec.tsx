import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
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
