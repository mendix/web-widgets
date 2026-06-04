import { ReactElement, useState, useEffect, KeyboardEvent } from "react";
import { useCurrentEditor } from "../../EditorContext";
import { BaseToolbarButtonProps } from "../helpers/toolbarTypes";

export function ToolbarButton({ config }: BaseToolbarButtonProps): ReactElement {
    const { editor } = useCurrentEditor();
    const [, setUpdateTrigger] = useState(0);

    // Force re-render when editor selection or content changes
    useEffect(() => {
        if (!editor) return;

        const handleUpdate = (): void => {
            setUpdateTrigger(prev => prev + 1);
        };

        editor.on("selectionUpdate", handleUpdate);
        editor.on("transaction", handleUpdate);

        return () => {
            editor.off("selectionUpdate", handleUpdate);
            editor.off("transaction", handleUpdate);
        };
    }, [editor]);

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
        if (!editor) return;

        // Handle Tab on last toolbar button - return focus to editor
        if (event.key === "Tab" && !event.shiftKey) {
            const toolbar = event.currentTarget.closest(".tiptap-toolbar");
            if (toolbar) {
                const buttons = Array.from(toolbar.querySelectorAll<HTMLButtonElement>("button:not([disabled])"));
                const currentIndex = buttons.indexOf(event.currentTarget);
                const isLastButton = currentIndex === buttons.length - 1;

                if (isLastButton) {
                    event.preventDefault();
                    editor.view.focus();
                }
            }
        }
    };

    const handleClick = (): void => {
        if (!editor) return;

        switch (config.action) {
            case "toggle":
                if (config.command) {
                    (editor.chain().focus() as any)[config.command]().run();
                }
                break;
            case "command":
                if (config.command) {
                    if (config.attrs) {
                        // Special handling for setFontFamily with fontValue
                        if (config.command === "setFontFamily" && config.attrs.fontValue) {
                            // New format: pass object with both fontFamily and fontValue
                            (editor.chain().focus() as any)[config.command](config.attrs).run();
                        } else {
                            // Check if attrs has a single value to spread (e.g., setTextAlign("left"))
                            const attrValues = Object.values(config.attrs);
                            if (attrValues.length === 1 && typeof attrValues[0] === "string") {
                                // Single string parameter commands (e.g., setTextAlign)
                                (editor.chain().focus() as any)[config.command](attrValues[0]).run();
                            } else {
                                // Object parameter commands (e.g., toggleHeading({ level: 1 }))
                                (editor.chain().focus() as any)[config.command](config.attrs).run();
                            }
                        }
                    } else {
                        (editor.chain().focus() as any)[config.command]().run();
                    }
                }
                break;
            case "heading":
                if (config.command && config.attrs) {
                    (editor.chain().focus() as any)[config.command](config.attrs).run();
                }
                break;
            case "custom":
                if (config.customAction) {
                    config.customAction(editor);
                }
                break;
        }
    };

    if (!editor) {
        return <></>;
    }

    const isActive = config.isActive ? config.isActive(editor) : false;
    const isDisabled = config.canExecute ? !config.canExecute(editor) : false;

    // Use activeIcon when button is active and activeIcon is provided
    const currentIcon = isActive && config.activeIcon ? config.activeIcon : config.icon;

    // Check if icon is an icon class name (contains hyphen) or plain text/emoji
    const isIconClass = !!currentIcon;

    return (
        <button
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            className={`${isActive ? "is-active" : ""} ${isIconClass ? "icon-button" : ""}`}
            title={config.title}
        >
            {isIconClass ? <span className={`icons icon-${currentIcon}`} /> : currentIcon}
        </button>
    );
}
