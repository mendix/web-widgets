import { fetchDocumentUrl, fetchImageThumbnail, saveFile } from "../mx-data";

function makeMxObject(name = "file.jpg") {
    return {
        getGuid: () => "guid-123",
        get: (_attr: string) => "2024-01-01T00:00:00.000Z",
        get2: (attr: string) => (attr === "Name" ? name : undefined)
    };
}

beforeEach(() => {
    (window as any).mx = undefined;
});

describe("saveFile", () => {
    it("passes file.name as the second argument to saveDocument", () => {
        const saveDocument = jest.fn((_id, _name, _meta, _file, resolve) => resolve());
        (window as any).mx = { data: { saveDocument } };

        const item = { id: "obj-1" } as any;
        const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });

        return saveFile(item, file).then(() => {
            expect(saveDocument).toHaveBeenCalledWith(
                "obj-1",
                "photo.jpg",
                {},
                file,
                expect.any(Function),
                expect.any(Function)
            );
        });
    });

    it("forwards the file blob itself as the fourth argument", () => {
        const saveDocument = jest.fn((_id, _name, _meta, _file, resolve) => resolve());
        (window as any).mx = { data: { saveDocument } };

        const item = { id: "obj-2" } as any;
        const file = new File(["content"], "report.pdf");

        return saveFile(item, file).then(() => {
            expect(saveDocument.mock.calls[0][3]).toBe(file);
        });
    });
});

describe("fetchDocumentUrl", () => {
    it("passes mxObject.get2('Name') as the fourth argument to getDocumentUrl", async () => {
        const getDocumentUrl = jest.fn().mockResolvedValue("http://host/doc");
        (window as any).mx = { data: { getDocumentUrl } };

        await fetchDocumentUrl(makeMxObject("report.pdf") as any);

        expect(getDocumentUrl).toHaveBeenCalledWith("guid-123", expect.anything(), false, "report.pdf");
    });

    it("requests a non-thumbnail URL (thumb=false)", async () => {
        const getDocumentUrl = jest.fn().mockResolvedValue("http://host/doc");
        (window as any).mx = { data: { getDocumentUrl } };

        await fetchDocumentUrl(makeMxObject() as any);

        expect(getDocumentUrl.mock.calls[0][2]).toBe(false);
    });
});

describe("fetchImageThumbnail", () => {
    it("passes mxObject.get2('Name') as the fourth argument to getDocumentUrl", async () => {
        const getDocumentUrl = jest.fn().mockResolvedValue("http://host/thumb-url");
        const getImageUrl = jest.fn((_url, resolve) => resolve("http://host/thumb.jpg"));
        (window as any).mx = { data: { getDocumentUrl, getImageUrl } };

        await fetchImageThumbnail(makeMxObject("banner.png") as any);

        expect(getDocumentUrl).toHaveBeenCalledWith("guid-123", expect.anything(), true, "banner.png");
    });

    it("requests a thumbnail URL (thumb=true)", async () => {
        const getDocumentUrl = jest.fn().mockResolvedValue("http://host/thumb-url");
        const getImageUrl = jest.fn((_url, resolve) => resolve("http://host/thumb.jpg"));
        (window as any).mx = { data: { getDocumentUrl, getImageUrl } };

        await fetchImageThumbnail(makeMxObject() as any);

        expect(getDocumentUrl.mock.calls[0][2]).toBe(true);
    });
});
