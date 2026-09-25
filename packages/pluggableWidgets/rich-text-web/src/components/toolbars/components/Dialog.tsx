import { ReactElement, useContext, useRef } from "react";
import { ImageDialog } from "./ImageDialog";
import { LinkDialog } from "./LinkDialog";
import { ToolbarDefaultButton } from "./ToolbarDefaultButton";
import { VideoDialog } from "./VideoDialog";
import { useT } from "../../../utils/i18n";
import { DialogToolbarButtonProps } from "../helpers/toolbarTypes";
import { DialogCommand, ToolbarContext, ToolbarContextType } from "../ToolbarConfig";

export function DialogToolbarButton({ config }: DialogToolbarButtonProps): ReactElement {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const t = useT();
    const { activeDropdown, pendingImageDialogFiles, handleDropdownToggle, handleDropdownClose } = useContext(
        ToolbarContext
    ) as ToolbarContextType;
    const dropdownType = config.command as DialogCommand;
    const isDropdownOpen = activeDropdown === dropdownType;
    const referenceElement = config.command === "insertImage" ? buttonRef.current : buttonRef.current;

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
                            return (
                                <ImageDialog
                                    onClose={handleDropdownClose}
                                    referenceElement={referenceElement}
                                    initialFiles={pendingImageDialogFiles?.length ? pendingImageDialogFiles : undefined}
                                />
                            );
                        case "insertVideo":
                            return <VideoDialog onClose={handleDropdownClose} referenceElement={referenceElement} />;
                        case "insertLink":
                            return <LinkDialog onClose={handleDropdownClose} referenceElement={referenceElement} />;
                        default:
                            return null;
                    }
                })()}
        </div>
    );
}
