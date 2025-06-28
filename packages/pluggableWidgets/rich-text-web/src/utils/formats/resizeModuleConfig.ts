import Quill from "quill";
import QuillResize from "quill-resize-module";
import { ACTION_DISPATCHER } from "../helpers";
import MxResizeToolbar from "../modules/resizeToolbar";
import MxResize from "../modules/resize";

export const RESIZE_MODULE_CONFIG = {
    modules: ["DisplaySize", MxResizeToolbar, MxResize, "Keyboard"],
    tools: [
        {
            text: "Edit Image",
            className: "icons icon-Image",
            verify(activeEle: HTMLElement) {
                return activeEle && activeEle.tagName === "IMG";
            },
            handler(
                this: { quill: Quill; resizer: typeof QuillResize },
                _evt: MouseEvent,
                _button: HTMLElement,
                activeEle: HTMLImageElement
            ) {
                const imageInfo = {
                    alt: activeEle.alt || "",
                    src: activeEle.src,
                    width: activeEle.width,
                    height: activeEle.height,
                    type: "image"
                };
                this.resizer.handleEdit();
                this.quill.emitter.emit(ACTION_DISPATCHER, imageInfo);
            }
        },
        {
            text: "Edit Video",
            className: "icons icon-Film",
            verify(activeEle: HTMLElement) {
                return activeEle && activeEle.tagName === "IFRAME" && activeEle.classList.contains("ql-video");
            },
            handler(
                this: typeof QuillResize.Modules.Base,
                _evt: MouseEvent,
                _button: HTMLElement,
                activeEle: HTMLIFrameElement
            ) {
                const videoInfo = {
                    src: activeEle.src,
                    width: activeEle.width,
                    height: activeEle.height,
                    type: "video"
                };
                this.resizer.handleEdit();
                this.quill.emitter.emit(ACTION_DISPATCHER, videoInfo);
            }
        }
    ],
    parchment: {
        image: {
            attribute: ["width", "height"]
        },
        video: {
            attribute: ["width", "height"]
        }
    }
};
