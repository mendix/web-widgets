import { getPatternMatch, matchPattern } from "../videoUrlPattern";

// matchPattern turns a user-entered video page URL into the provider's embed URL plus the
// default iframe size; unknown URLs yield null. The protocol of the input is preserved
// (http/https), and a bare "www." input defaults to https.
describe("matchPattern", () => {
    it.each([
        {
            name: "YouTube watch URL",
            input: "https://www.youtube.com/watch?v=abc123",
            url: "https://www.youtube.com/embed/abc123",
            w: 560,
            h: 314
        },
        {
            name: "YouTube watch URL with extra params",
            input: "https://www.youtube.com/watch?v=abc123&t=42",
            url: "https://www.youtube.com/embed/abc123?t=42",
            w: 560,
            h: 314
        },
        {
            name: "YouTube short URL",
            input: "https://youtu.be/abc123",
            url: "https://www.youtube.com/embed/abc123",
            w: 560,
            h: 314
        },
        {
            name: "YouTube embed URL",
            input: "https://www.youtube.com/embed/abc123",
            url: "https://www.youtube.com/embed/abc123",
            w: 560,
            h: 314
        },
        {
            name: "Vimeo URL",
            input: "https://vimeo.com/123456",
            url: "https://player.vimeo.com/video/123456?title=0&byline=0&portrait=0&color=8dc7dc",
            w: 425,
            h: 350
        },
        {
            name: "Vimeo URL with privacy hash",
            input: "https://vimeo.com/123456?h=abc",
            url: "https://player.vimeo.com/video/123456?h=abc&title=0&byline=0&portrait=0&color=8dc7dc",
            w: 425,
            h: 350
        },
        {
            name: "Dailymotion URL",
            input: "https://www.dailymotion.com/video/x7abc",
            url: "https://www.dailymotion.com/embed/video/x7abc",
            w: 480,
            h: 270
        },
        {
            name: "Google Maps URL",
            input: "https://maps.google.com/maps/ms?ie=UTF8&msa=0&msid=210840796990036384893.00047ac4ee2b8b5d0b2b5",
            url: "https://maps.google.com/maps/ms?msid=210840796990036384893.00047ac4ee2b8b5d0b2b5&output=embed",
            w: 425,
            h: 350
        },
        {
            name: "http input keeps http",
            input: "http://youtu.be/abc123",
            url: "http://www.youtube.com/embed/abc123",
            w: 560,
            h: 314
        },
        {
            name: "www. input defaults to https",
            input: "www.youtube.com/watch?v=abc123",
            url: "https://www.youtube.com/embed/abc123",
            w: 560,
            h: 314
        }
    ])("$name", ({ input, url, w, h }) => {
        expect(matchPattern(input)).toMatchObject({ type: "iframe", url, w, h });
    });

    it.each(["https://example.com/video/1", "https://evil.com/watch?x=1", "not a url", ""])(
        "returns null for unknown URL %p",
        input => {
            expect(matchPattern(input)).toBeNull();
            expect(getPatternMatch(input)).toBeNull();
        }
    );

    it("always targets the provider host, even when the provider name appears in another host's path", () => {
        expect(matchPattern("https://evil.com/youtu.be/abc")?.url).toBe("https://www.youtube.com/embed/abc");
    });
});

describe("getPatternMatch", () => {
    it("returns the raw pattern with its template URL (not the resolved one)", () => {
        const pattern = getPatternMatch("https://youtu.be/abc123");

        expect(pattern).toMatchObject({ type: "iframe", w: 560, h: 314, url: "www.youtube.com/embed/$1" });
    });
});
