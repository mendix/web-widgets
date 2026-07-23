import { ReactElement, useContext, useRef } from "react";
import { useT } from "../../../utils/i18n";
import { DialogToolbarButtonProps } from "../helpers/toolbarTypes";
import { DialogCommand, ToolbarContext, ToolbarContextType } from "../ToolbarConfig";
import { ImageDialog } from "./ImageDialog";
import { LinkDialog } from "./LinkDialog";
import { ToolbarDefaultButton } from "./ToolbarDefaultButton";
import { VideoDialog } from "./VideoDialog";

export function DialogToolbarButton({ config }: DialogToolbarButtonProps): ReactElement {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const t = useT();
    const { activeDropdown, handleDropdownToggle, handleDropdownClose } = useContext(
        ToolbarContext
    ) as ToolbarContextType;
    const dropdownType = config.command as DialogCommand;
    const isDropdownOpen = activeDropdown === dropdownType;

    return (
        <div style={{ position: "relative" }}>
            <ToolbarDefaultButton
                ref={buttonRef}
                onClick={() => handleDropdownToggle(dropdownType)}
                icon={config.icon}
                title={t(config.title)}
            />
            {isDropdownOpen &&
                (() => {
                    switch (dropdownType) {
                        case "insertImage":
                            return <ImageDialog onClose={handleDropdownClose} referenceElement={buttonRef.current} />;
                        case "insertVideo":
                            return <VideoDialog onClose={handleDropdownClose} referenceElement={buttonRef.current} />;
                        case "insertLink":
                            return <LinkDialog onClose={handleDropdownClose} referenceElement={buttonRef.current} />;
                        default:
                            return null;
                    }
                })()}
        </div>
    );
}
