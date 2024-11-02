import { Scope } from "parchment";
import Video from "quill/formats/video";
import { videoConfigType } from "../formats";
import { matchPattern } from "../videoUrlPattern";
import "./video.scss";

/**
 * custom video link handler, allowing width and height config
 */
class CustomVideo extends Video {
    html(): string {
        return this.domNode.outerHTML;
    }

    length(): number {
        // asume that video has child to be able to delete embedded video
        return 2;
    }

    static create(value: unknown): Element {
        if ((value as videoConfigType)?.src !== undefined) {
            const videoConfig = value as videoConfigType;
            const urlPatterns = matchPattern(videoConfig.src);
            const node = super.create(urlPatterns?.url || videoConfig.src) as HTMLElement;
            return node;
        } else {
            // @ts-expect-error type mismatch expected
            return super.create(value);
        }
    }
}

CustomVideo.scope = Scope.INLINE_BLOT;

export default CustomVideo;
