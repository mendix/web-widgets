import Link from "quill/formats/link";
import { linkConfigType } from "../formats";

export default class CustomLink extends Link {
    format(name: string, value: unknown): void {
        console.log("[DEV] link format", value);
        if (name !== this.statics.blotName || !value) {
            super.format(name, value);
        } else if ((value as linkConfigType)?.href !== undefined) {
            const linkConfig = value as linkConfigType;
            // @ts-expect-error the constructor is generic function, ts will consider sanitize not exist
            this.domNode.setAttribute("href", this.constructor.sanitize(linkConfig.href));
            this.domNode.setAttribute("target", linkConfig.target);
        } else {
            // @ts-expect-error the constructor is generic function, ts will consider sanitize not exist
            this.domNode.setAttribute("href", this.constructor.sanitize(value));
        }
    }

    static create(value: unknown): HTMLElement {
        console.log("[DEV] link create", value);
        if ((value as linkConfigType)?.href !== undefined) {
            const linkConfig = value as linkConfigType;
            const node = super.create(linkConfig.href) as HTMLElement;
            node.setAttribute("href", this.sanitize(linkConfig.href));
            node.setAttribute("rel", "noopener noreferrer");
            node.setAttribute("title", linkConfig.title);
            node.setAttribute("target", linkConfig.target || "_blank");
            return node;
        } else {
            // @ts-expect-error type mismatch expected
            return super.create(value);
        }
    }
}
