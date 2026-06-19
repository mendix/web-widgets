import { downloadFile } from "../helpers";

describe("downloadFile", () => {
    let openSpy: jest.SpyInstance;

    beforeEach(() => {
        openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    });

    afterEach(() => {
        openSpy.mockRestore();
    });

    it("does nothing when the file url is undefined", () => {
        downloadFile(undefined);

        expect(openSpy).not.toHaveBeenCalled();
    });

    it("opens the file in a dedicated window with a target query param", () => {
        downloadFile("https://apps.example.com/file/123");

        expect(openSpy).toHaveBeenCalledTimes(1);
        const [url, windowName] = openSpy.mock.calls[0];
        expect(windowName).toBe("mendix_file");
        expect(url.toString()).toBe("https://apps.example.com/file/123?target=window");
    });

    it("preserves existing query params when appending target", () => {
        downloadFile("https://apps.example.com/file/123?foo=bar");

        const [url] = openSpy.mock.calls[0];
        expect(url.searchParams.get("foo")).toBe("bar");
        expect(url.searchParams.get("target")).toBe("window");
    });
});
