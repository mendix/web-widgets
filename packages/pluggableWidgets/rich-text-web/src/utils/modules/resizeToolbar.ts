import QuillResize from "quill-resize-module";

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
export default class MxResizeToolbar extends QuillResize.Modules?.Toolbar {
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
