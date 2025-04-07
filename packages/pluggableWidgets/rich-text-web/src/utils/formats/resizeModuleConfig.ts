import Quill from "quill";
import QuillResize from "quill-resize-module";
import { ACTION_DISPATCHER } from "../helpers";

type ToolbarTool = {
    text: string;
    className: string;
    verify: (activeEle: HTMLElement) => boolean;
    handler: (
        this: typeof QuillResize.Modules.Base,
        _evt: MouseEvent,
        _button: HTMLElement,
        activeEle: HTMLIFrameElement
    ) => void;
};

// eslint-disable-next-line no-unsafe-optional-chaining
class MxResizeToolbar extends QuillResize.Modules?.Toolbar {
    _addToolbarButtons(): void {
        const buttons: HTMLButtonElement[] = [];
        this.options.tools.forEach((tool: ToolbarTool) => {
            if (tool.verify && tool.verify.call(this, this.activeEle) === false) {
                return;
            }

            const button = document.createElement("button");
            button.className = tool.className;
            buttons.push(button);
            button.setAttribute("aria-label", tool.text);
            button.setAttribute("type", "button");

            button.addEventListener("click", evt => {
                tool.handler.call(this, evt, button, this.activeEle);
                // image may change position; redraw drag handles
                this.requestUpdate();
            });
            this.toolbar.appendChild(button);
        });
    }
}

export const RESIZE_MODULE_CONFIG = {
    modules: ["DisplaySize", MxResizeToolbar, "Resize", "Keyboard"],
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
