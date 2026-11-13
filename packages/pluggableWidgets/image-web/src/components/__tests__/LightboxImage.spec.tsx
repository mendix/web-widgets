import { getLightboxImageStyle, getLightboxImageWidth } from "../Image/LightboxImage";

describe("getLightboxImageWidth", () => {
    it("returns undefined when the natural size is at least the size on the page", () => {
        expect(getLightboxImageWidth({ width: 400, height: 300 }, { width: 200, height: 150 })).toBeUndefined();
        expect(getLightboxImageWidth({ width: 400, height: 300 }, { width: 400, height: 300 })).toBeUndefined();
        expect(getLightboxImageWidth({ width: 400, height: 300 }, undefined)).toBeUndefined();
    });

    it("uses the width on the page when it is larger than the natural width", () => {
        expect(getLightboxImageWidth({ width: 400, height: 300 }, { width: 560, height: 420 })).toBe(
            "min(560px, var(--mx-image-viewer-lightbox-max-width), calc(var(--mx-image-viewer-lightbox-max-height) * 1.3333333333333333))"
        );
    });

    it("uses the height on the page when the image on the page is taller than its aspect ratio", () => {
        expect(getLightboxImageWidth({ width: 160, height: 120 }, { width: 200, height: 450 })).toMatch(/^min\(600px,/);
    });

    it("does not enlarge a cropped image whose box on the page fits inside the natural size", () => {
        // aspect-ratio: 1 / 1 with object-fit: cover shows a 400x300 image at 300x300.
        expect(getLightboxImageWidth({ width: 400, height: 300 }, { width: 300, height: 300 })).toBeUndefined();
    });
});

describe("getLightboxImageStyle", () => {
    it("removes the properties that size the image on the page and keeps the others", () => {
        expect(
            getLightboxImageStyle({
                width: "50%",
                maxHeight: "250px",
                aspectRatio: "1 / 1",
                objectFit: "cover",
                opacity: 0.9
            })
        ).toEqual({ opacity: 0.9 });
    });
});
