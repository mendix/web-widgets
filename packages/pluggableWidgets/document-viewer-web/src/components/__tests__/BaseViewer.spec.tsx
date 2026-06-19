import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import BaseViewer, { BaseControlViewer } from "../BaseViewer";

const file = {
    status: "available" as const,
    value: { uri: "https://apps.example.com/file/42.pdf", name: "report.pdf" }
};

describe("BaseViewer", () => {
    it("renders the file name and children", () => {
        render(
            <BaseViewer fileName="report.pdf">
                <span>content</span>
            </BaseViewer>
        );

        expect(screen.getByText("report.pdf")).toBeInTheDocument();
        expect(screen.getByText("content")).toBeInTheDocument();
    });
});

describe("BaseControlViewer", () => {
    it("renders the file name, custom controls and children", () => {
        render(
            <BaseControlViewer file={file} CustomControl={<button>custom</button>}>
                <span>page content</span>
            </BaseControlViewer>
        );

        expect(screen.getByText("report.pdf")).toBeInTheDocument();
        expect(screen.getByText("custom")).toBeInTheDocument();
        expect(screen.getByText("page content")).toBeInTheDocument();
    });

    it("downloads the file in a new window when the download button is clicked", () => {
        const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

        render(
            <BaseControlViewer file={file}>
                <span>page content</span>
            </BaseControlViewer>
        );

        fireEvent.click(screen.getByLabelText("Download"));

        expect(openSpy).toHaveBeenCalledTimes(1);
        const [url, windowName] = openSpy.mock.calls[0];
        expect(windowName).toBe("mendix_file");
        expect(url!.toString()).toBe("https://apps.example.com/file/42.pdf?target=window");
        openSpy.mockRestore();
    });

    it("exposes zoom controls", () => {
        render(
            <BaseControlViewer file={file}>
                <span>page content</span>
            </BaseControlViewer>
        );

        expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
        expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
        expect(screen.getByLabelText("Fit to width")).toBeInTheDocument();
    });
});
