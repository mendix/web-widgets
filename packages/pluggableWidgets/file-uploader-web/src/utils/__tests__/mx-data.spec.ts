import { saveFile } from "../mx-data";

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
