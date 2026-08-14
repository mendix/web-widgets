import { ReactElement, useState } from "react";
import { HelpDialog } from "./HelpDialog";
import { ToolbarDefaultButton } from "./ToolbarDefaultButton";
import { useT } from "../../../utils/i18n";

/**
 * Toolbar help button. Renders the help icon and toggles the keyboard-shortcuts
 * modal.
 */
export function HelpButton(): ReactElement {
    const [isOpen, setIsOpen] = useState(false);
    const t = useT();

    return (
        <>
            <ToolbarDefaultButton
                className="icon-button help-button"
                title={t("help.title")}
                aria-label={t("help.title")}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                icon="Help"
                onClick={() => setIsOpen(true)}
            />
            {isOpen && <HelpDialog onClose={() => setIsOpen(false)} />}
        </>
    );
}
