export interface ParsedEmbed {
    valid: boolean;
    error?: string;
    src?: string;
    width?: string;
    height?: string;
    title?: string | null;
    frameborder?: string;
    allow?: string | null;
    allowfullscreen?: boolean;
    domain?: string;
}

// Whitelist of allowed domains for embed codes
const ALLOWED_DOMAINS = [
    "youtube.com",
    "www.youtube.com",
    "player.vimeo.com",
    "vimeo.com",
    "player.dailymotion.com",
    "dailymotion.com",
    "codepen.io",
    "jsfiddle.net",
    "stackblitz.com",
    "codesandbox.io",
    "maps.google.com",
    "www.google.com"
];

function isDomainAllowed(hostname: string): boolean {
    return ALLOWED_DOMAINS.some(allowed => hostname === allowed || hostname.endsWith("." + allowed));
}

export function parseEmbedCode(html: string): ParsedEmbed {
    try {
        // Parse HTML safely using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Find iframe element
        const iframe = doc.querySelector("iframe");

        if (!iframe) {
            return {
                valid: false,
                error: "No iframe found in embed code"
            };
        }

        // Extract and validate src attribute
        const src = iframe.getAttribute("src");

        if (!src) {
            return {
                valid: false,
                error: "Iframe missing src attribute"
            };
        }

        // Security: Block javascript: URLs
        if (src.toLowerCase().startsWith("javascript:")) {
            return {
                valid: false,
                error: "JavaScript URLs are not allowed"
            };
        }

        // Security: Block data: URLs
        if (src.toLowerCase().startsWith("data:")) {
            return {
                valid: false,
                error: "Data URLs are not allowed"
            };
        }

        // Validate URL format
        try {
            const url = new URL(src);

            // Security: Only allow http and https protocols
            if (url.protocol !== "http:" && url.protocol !== "https:") {
                return {
                    valid: false,
                    error: "Only HTTP/HTTPS URLs are allowed"
                };
            }

            // Check domain whitelist
            const domain = url.hostname;

            if (!isDomainAllowed(domain)) {
                return {
                    valid: false,
                    error: `Domain "${domain}" is not in the allowed list. Supported: YouTube, Vimeo, Dailymotion, CodePen, etc.`
                };
            }

            // Extract safe attributes
            const width = iframe.getAttribute("width") || "640";
            const height = iframe.getAttribute("height") || "480";
            const title = iframe.getAttribute("title") || null;
            const frameborder = iframe.getAttribute("frameborder") || "0";
            const allow = iframe.getAttribute("allow") || null;
            const allowfullscreen = iframe.hasAttribute("allowfullscreen");

            return {
                valid: true,
                src,
                width,
                height,
                title,
                frameborder,
                allow,
                allowfullscreen,
                domain
            };
        } catch (_urlError) {
            return {
                valid: false,
                error: "Invalid URL in src attribute"
            };
        }
    } catch (_parseError) {
        return {
            valid: false,
            error: "Failed to parse embed code"
        };
    }
}
