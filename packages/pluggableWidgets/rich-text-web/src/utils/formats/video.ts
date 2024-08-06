import Video from "quill/formats/video";
import { videoConfigType } from "../formats";

export default class CustomVideo extends Video {
    html(): string {
        return this.domNode.outerHTML;
    }

    static create(value: unknown): Element {
        if ((value as videoConfigType)?.src !== undefined) {
            const videoConfig = value as videoConfigType;
            const node = super.create(videoConfig.src) as Element;

            if (videoConfig.width && videoConfig.width > 0) {
                node.setAttribute("width", videoConfig.width.toString());
            }

            if (videoConfig.height && videoConfig.height > 0) {
                node.setAttribute("height", videoConfig.height.toString());
            }

            return node;
        } else {
            // @ts-expect-error type mismatch expected
            return super.create(value);
        }
    }
}
