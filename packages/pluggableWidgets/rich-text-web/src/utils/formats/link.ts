import * as linkify from "linkifyjs";
import Link from "quill/formats/link";
import { linkConfigType } from "../formats";

function getLink(url: string): string {
    const foundLinks = linkify.find(url, {
        defaultProtocol: "https"
    });
    let results = url;
    if (foundLinks && foundLinks.length > 0) {
        results = foundLinks[0].href;
    }

    return results;
}

/**
 * Custom Link handler, allowing extra config: target and default protocol.
 */
export default class CustomLink extends Link {
    format(name: string, value: unknown): void {
        if (name !== this.statics.blotName || !value) {
            super.format(name, value);
        } else if ((value as linkConfigType)?.href !== undefined) {
            const linkConfig = value as linkConfigType;
            // @ts-expect-error the constructor is generic function, ts will consider sanitize not exist
            this.domNode.setAttribute("href", getLink(this.constructor.sanitize(linkConfig.href)));
            this.domNode.setAttribute("target", linkConfig.target ?? "_blank");
            this.domNode.setAttribute("title", linkConfig.title ?? "");
            this.domNode.textContent = linkConfig.text ?? linkConfig.href;
        } else {
            // @ts-expect-error the constructor is generic function, ts will consider sanitize not exist
            this.domNode.setAttribute("href", getLink(this.constructor.sanitize(value)));
        }
    }

    static create(value: unknown): HTMLElement {
        if ((value as linkConfigType)?.href !== undefined) {
            const linkConfig = value as linkConfigType;
            const node = super.create(linkConfig.href) as HTMLElement;
            node.setAttribute("href", getLink(this.sanitize(linkConfig.href)));
            node.setAttribute("rel", "noopener noreferrer");
            node.setAttribute("title", linkConfig.title ?? linkConfig.href);
            node.setAttribute("target", linkConfig.target || "_blank");
            return node;
        } else {
            // @ts-expect-error type mismatch expected
            return super.create(value);
        }
    }
}
