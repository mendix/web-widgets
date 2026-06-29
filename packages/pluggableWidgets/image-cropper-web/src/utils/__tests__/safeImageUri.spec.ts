import { safeImageUri } from "../safeImageUri";

describe("safeImageUri", () => {
    test.each([
        "http://localhost/img.png",
        "https://cdn.example.com/a.jpg?x=1",
        "blob:http://localhost/abc-123",
        "data:image/png;base64,iVBORw0KGgo="
    ])("passes through allowed scheme: %s", uri => {
        expect(safeImageUri(uri)).toBe(uri);
    });

    test.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:msgbox(1)"])(
        "returns undefined for disallowed scheme: %s",
        uri => {
            expect(safeImageUri(uri)).toBeUndefined();
        }
    );

    test("returns undefined for nullish input", () => {
        expect(safeImageUri(undefined)).toBeUndefined();
        expect(safeImageUri("")).toBeUndefined();
    });
});
