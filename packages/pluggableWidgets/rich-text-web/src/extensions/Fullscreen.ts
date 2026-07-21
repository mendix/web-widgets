import { Extension } from "@tiptap/core";

export interface FullscreenOptions {
    widgetSelector: string;
    fullscreenClass: string;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        fullscreen: {
            /**
             * Toggle fullscreen mode
             */
            toggleFullscreen: () => ReturnType;
            /**
             * Enter fullscreen mode
             */
            enterFullscreen: () => ReturnType;
            /**
             * Exit fullscreen mode
             */
            exitFullscreen: () => ReturnType;
        };
    }
}

export const Fullscreen = Extension.create<FullscreenOptions>({
    name: "fullscreen",

    addOptions() {
        return {
            widgetSelector: ".widget-rich-text",
            fullscreenClass: "fullscreen"
        };
    },

    addCommands() {
        return {
            toggleFullscreen: () => () => {
                const widgetEl = document.querySelector(this.options.widgetSelector);
                if (widgetEl) {
                    widgetEl.classList.toggle(this.options.fullscreenClass);
                    return true;
                }
                return false;
            },

            enterFullscreen: () => () => {
                const widgetEl = document.querySelector(this.options.widgetSelector);
                if (widgetEl && !widgetEl.classList.contains(this.options.fullscreenClass)) {
                    widgetEl.classList.add(this.options.fullscreenClass);
                    return true;
                }
                return false;
            },

            exitFullscreen: () => () => {
                const widgetEl = document.querySelector(this.options.widgetSelector);
                if (widgetEl && widgetEl.classList.contains(this.options.fullscreenClass)) {
                    widgetEl.classList.remove(this.options.fullscreenClass);
                    return true;
                }
                return false;
            }
        };
    },

    addKeyboardShortcuts() {
        return {
            Escape: () => {
                // Only handle ESC if fullscreen is active
                const widgetEl = document.querySelector(this.options.widgetSelector);
                if (widgetEl?.classList.contains(this.options.fullscreenClass)) {
                    return this.editor.commands.exitFullscreen();
                }
                // Pass through to other handlers if not in fullscreen
                return false;
            }
        };
    }
});
