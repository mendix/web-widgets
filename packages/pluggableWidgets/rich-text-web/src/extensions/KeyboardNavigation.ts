import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface KeyboardNavigationOptions {
    wrapperSelector: string;
    toolbarSelector: string;
    statusBarSelector: string;
    widgetSelector: string;
}

export const KeyboardNavigation = Extension.create<KeyboardNavigationOptions>({
    name: "keyboardNavigation",

    addOptions() {
        return {
            wrapperSelector: ".tiptap-wrapper",
            toolbarSelector: ".tiptap-toolbar",
            statusBarSelector: ".rich-text-status-bar",
            widgetSelector: ".widget-rich-text"
        };
    },

    addProseMirrorPlugins() {
        const options = this.options;

        return [
            new Plugin({
                key: new PluginKey("keyboardNavigation"),
                props: {
                    handleKeyDown: (view, event) => {
                        // Alt+F10: Focus toolbar or wrapper
                        if (event.altKey && event.key === "F10") {
                            event.preventDefault();
                            event.stopPropagation();

                            // Find the widget container relative to this editor
                            const editorDom = view.dom;
                            const widget = editorDom.closest(options.widgetSelector);

                            if (!widget) {
                                return false;
                            }

                            // Try to find toolbar first
                            const toolbar = widget.querySelector(options.toolbarSelector);

                            if (toolbar) {
                                // Toolbar exists - focus first enabled button
                                const firstButton = toolbar.querySelector<HTMLButtonElement>("button:not([disabled])");
                                if (firstButton) {
                                    firstButton.focus();
                                } else {
                                    // No enabled buttons - focus toolbar container
                                    (toolbar as HTMLElement).setAttribute("tabindex", "0");
                                    (toolbar as HTMLElement).focus();
                                }
                            } else {
                                // Toolbar hidden - focus wrapper instead
                                const wrapper = widget.querySelector<HTMLElement>(options.wrapperSelector);
                                if (wrapper) {
                                    wrapper.setAttribute("tabindex", "0");
                                    wrapper.focus();
                                }
                            }

                            return true;
                        }

                        // Alt+F11: Focus status bar
                        if (event.altKey && event.key === "F11") {
                            event.preventDefault();
                            event.stopPropagation();

                            const editorDom = view.dom;
                            const widget = editorDom.closest(options.widgetSelector);

                            if (!widget) {
                                return false;
                            }

                            const statusBar = widget.querySelector<HTMLElement>(options.statusBarSelector);
                            if (statusBar) {
                                statusBar.focus();
                            }

                            return true;
                        }

                        // Escape: Return to editor (if focus is outside)
                        if (event.key === "Escape") {
                            const editorDom = view.dom;
                            const activeElement = document.activeElement;

                            // Only handle if focus is NOT in editor
                            if (activeElement && !editorDom.contains(activeElement)) {
                                event.preventDefault();

                                // Return focus to editor, restoring cursor position
                                view.focus();

                                return true;
                            }
                        }

                        return false;
                    }
                }
            })
        ];
    }
});
