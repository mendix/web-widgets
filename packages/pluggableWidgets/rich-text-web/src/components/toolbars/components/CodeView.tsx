import { ReactElement } from "react";
import { useCurrentEditor } from "../../EditorContext";
import { BaseToolbarButtonProps } from "../helpers/toolbarTypes";

export function CodeViewToolbarButton({ config }: BaseToolbarButtonProps): ReactElement {
    const { editor, codeViewState, codeViewDispatch } = useCurrentEditor();

    const handleToggle = (): void => {
        if (!editor) return;

        if (!codeViewState.isCodeView) {
            // Switching to code view - show HTML
            const html = editor.getHTML();
            codeViewDispatch({ type: "ENTER_CODE_VIEW", html });
        } else {
            // Switching back to editor - show confirmation
            codeViewDispatch({ type: "EXIT_CODE_VIEW_REQUEST" });
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`icon-button ${codeViewState.isCodeView ? "is-active" : ""}`}
            title={config.title}
        >
            <span className={`icons icon-${config.icon}`} />
        </button>
    );
}
