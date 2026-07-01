import { useContext, useRef, ReactElement } from "react";
import { useCurrentEditor } from "../../EditorContext";
import { ToolbarContext, ToolbarContextType } from "../ToolbarConfig";
import { BaseToolbarButtonProps } from "../helpers/toolbarTypes";
import { TableGridSelector } from "./TableGridSelector";

export function TableGridToolbarButton({ config }: BaseToolbarButtonProps): ReactElement {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { editor } = useCurrentEditor();
    const { activeDropdown, handleDropdownToggle, handleDropdownClose } = useContext(
        ToolbarContext
    ) as ToolbarContextType;
    const dropdownType = "insertTable";
    const isDropdownOpen = activeDropdown === dropdownType;

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => handleDropdownToggle(dropdownType)}
                className="icon-button"
                title={config.title}
            >
                <span className={`icons icon-${config.icon}`} />
            </button>
            {editor && isDropdownOpen && (
                <TableGridSelector editor={editor} onClose={handleDropdownClose} referenceElement={buttonRef.current} />
            )}
        </>
    );
}
