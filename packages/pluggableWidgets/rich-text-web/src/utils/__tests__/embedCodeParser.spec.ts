import { parseEmbedCode } from "../embedCodeParser";

// parseEmbedCode is the security gate for user-supplied embed HTML: it must accept only an
// <iframe> whose src is an absolute http(s) URL on the domain allowlist, and fill in safe
// defaults for the attributes it extracts.
describe("parseEmbedCode — rejects unsafe or invalid input", () => {
    it.each([
        { name: "no iframe", html: "<div>hello</div>", error: "No iframe found in embed code" },
        { name: "empty string", html: "", error: "No iframe found in embed code" },
        { name: "iframe without src", html: "<iframe></iframe>", error: "Iframe missing src attribute" },
        { name: "iframe with empty src", html: '<iframe src=""></iframe>', error: "Iframe missing src attribute" },
        {
            name: "javascript: src",
            html: '<iframe src="javascript:alert(1)"></iframe>',
            error: "JavaScript URLs are not allowed"
        },
        {
            name: "mixed-case JavaScript: src",
            html: '<iframe src="JaVaScRiPt:alert(1)"></iframe>',
            error: "JavaScript URLs are not allowed"
        },
        {
            name: "uppercase DATA: src",
            html: '<iframe src="DATA:text/html,<script>alert(1)</script>"></iframe>',
            error: "Data URLs are not allowed"
        },
        {
            name: "ftp:// src",
            html: '<iframe src="ftp://youtube.com/x"></iframe>',
            error: "Only HTTP/HTTPS URLs are allowed"
        },
        { name: "relative src", html: '<iframe src="/embed/x"></iframe>', error: "Invalid URL in src attribute" },
        { name: "malformed URL", html: '<iframe src="https://"></iframe>', error: "Invalid URL in src attribute" }
    ])("$name", ({ html, error }) => {
        const result = parseEmbedCode(html);

        expect(result.valid).toBe(false);
        expect(result.error).toBe(error);
        expect(result.src).toBeUndefined();
    });

    it.each([
        { name: "disallowed domain", src: "https://evil.com/x", host: "evil.com" },
        {
            name: "allowlisted name as subdomain prefix",
            src: "https://youtube.com.evil.io/embed/x",
            host: "youtube.com.evil.io"
        },
        {
            name: "allowlisted name without dot boundary",
            src: "https://notyoutube.com/embed/x",
            host: "notyoutube.com"
        },
        { name: "allowlisted name in userinfo", src: "https://youtube.com@evil.com/embed/x", host: "evil.com" },
        { name: "allowlisted name in path", src: "https://evil.com/www.youtube.com/embed/x", host: "evil.com" }
    ])("rejects $name", ({ src, host }) => {
        const result = parseEmbedCode(`<iframe src="${src}"></iframe>`);

        expect(result.valid).toBe(false);
        expect(result.error).toContain(`Domain "${host}" is not in the allowed list`);
    });
});

describe("parseEmbedCode — accepts allowlisted embeds", () => {
    it("returns the src and applies default attributes when none are given", () => {
        const result = parseEmbedCode('<iframe src="https://player.vimeo.com/video/123"></iframe>');

        expect(result).toEqual({
            valid: true,
            src: "https://player.vimeo.com/video/123",
            width: "640",
            height: "480",
            title: null,
            frameborder: "0",
            allow: null,
            allowfullscreen: false,
            domain: "player.vimeo.com"
        });
    });

    it("keeps explicit attributes from the iframe", () => {
        const result = parseEmbedCode(
            '<iframe src="https://www.youtube.com/embed/abc" width="560" height="315" title="Clip" ' +
                'frameborder="1" allow="autoplay" allowfullscreen></iframe>'
        );

        expect(result).toMatchObject({
            valid: true,
            src: "https://www.youtube.com/embed/abc",
            width: "560",
            height: "315",
            title: "Clip",
            frameborder: "1",
            allow: "autoplay",
            allowfullscreen: true,
            domain: "www.youtube.com"
        });
    });

    it.each([
        "https://youtube.com/embed/x",
        "https://codepen.io/pen/x",
        "https://m.youtube.com/embed/x",
        "http://player.dailymotion.com/embed/video/x"
    ])("accepts %s (exact or subdomain of an allowlisted host)", src => {
        expect(parseEmbedCode(`<iframe src="${src}"></iframe>`).valid).toBe(true);
    });

    it("only inspects the first iframe in the snippet", () => {
        const result = parseEmbedCode(
            '<iframe src="https://www.youtube.com/embed/a"></iframe><iframe src="https://evil.com/x"></iframe>'
        );

        expect(result.valid).toBe(true);
        expect(result.src).toBe("https://www.youtube.com/embed/a");
    });
});
