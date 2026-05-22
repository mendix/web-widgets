import { ReactElement } from "react";
import { useCurrentEditor } from "../../EditorContext";
import { BaseToolbarButtonProps } from "../helpers/toolbarTypes";

export function ToolbarButton({ config }: BaseToolbarButtonProps): ReactElement {
    const { editor } = useCurrentEditor();
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
                        (editor.chain().focus() as any)[config.command](config.attrs).run();
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

    // Check if icon is an icon class name (contains hyphen) or plain text/emoji
    const isIconClass = !!config.icon;

    return (
        <button
            onClick={handleClick}
            disabled={isDisabled}
            className={`${isActive ? "is-active" : ""} ${isIconClass ? "icon-button" : ""}`}
            title={config.title}
        >
            {isIconClass ? <span className={`icons icon-${config.icon}`} /> : config.icon}
        </button>
    );
}
