import { ReactElement } from "react";
import { ToolbarDefaultButton } from "./ToolbarDefaultButton";
import { useT } from "../../../utils/i18n";
import { useCurrentEditor } from "../../EditorContext";
import { BaseToolbarButtonProps } from "../helpers/toolbarTypes";

export function CodeViewToolbarButton({ config }: BaseToolbarButtonProps): ReactElement {
    const { editor, codeViewState, codeViewDispatch } = useCurrentEditor();
    const t = useT();

    const handleToggle = (): void => {
        if (!editor) return;

        if (!codeViewState.isCodeView) {
            // Switching to code view - show HTML
            const html = editor.isEmpty ? "" : editor.getHTML();
            codeViewDispatch({ type: "ENTER_CODE_VIEW", html });
        } else {
            // Switching back to editor - show confirmation
            codeViewDispatch({ type: "EXIT_CODE_VIEW_REQUEST" });
        }
    };

    return (
        <ToolbarDefaultButton
            onClick={handleToggle}
            isActive={codeViewState.isCodeView}
            allowInCodeView
            icon={config.icon}
            title={t(config.title)}
        />
    );
}
