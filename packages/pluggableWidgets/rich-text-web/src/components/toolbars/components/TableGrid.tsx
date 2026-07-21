import { useContext, useRef, ReactElement } from "react";
import { useCurrentEditor } from "../../EditorContext";
import { BaseToolbarButtonProps } from "../helpers/toolbarTypes";
import { ToolbarContext, ToolbarContextType } from "../ToolbarConfig";
import { TableGridSelector } from "./TableGridSelector";
import { ToolbarDefaultButton } from "./ToolbarDefaultButton";

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
            <ToolbarDefaultButton
                ref={buttonRef}
                onClick={() => handleDropdownToggle(dropdownType)}
                icon={config.icon}
                title={config.title}
            />
            {editor && isDropdownOpen && (
                <TableGridSelector editor={editor} onClose={handleDropdownClose} referenceElement={buttonRef.current} />
            )}
        </>
    );
}
