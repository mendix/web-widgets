import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
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
