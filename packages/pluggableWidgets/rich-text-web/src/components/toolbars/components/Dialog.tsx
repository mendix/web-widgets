import { ReactElement, useContext, useRef } from "react";
import { DialogToolbarButtonProps } from "../helpers/toolbarTypes";
import { DialogCommand, ToolbarContext, ToolbarContextType } from "../ToolbarConfig";
import { ImageDialog } from "./ImageDialog";
import { LinkDialog } from "./LinkDialog";
import { VideoDialog } from "./VideoDialog";

export function DialogToolbarButton({ config, imageSourceContent }: DialogToolbarButtonProps): ReactElement {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { activeDropdown, handleDropdownToggle, handleDropdownClose } = useContext(
        ToolbarContext
    ) as ToolbarContextType;
    const dropdownType = config.command as DialogCommand;
    const isDropdownOpen = activeDropdown === dropdownType;

    return (
        <div style={{ position: "relative" }}>
            <button
                ref={buttonRef}
                onClick={() => handleDropdownToggle(dropdownType)}
                className="icon-button"
                title={config.title}
            >
                <span className={`icons icon-${config.icon}`} />
            </button>
            {isDropdownOpen &&
                (() => {
                    switch (dropdownType) {
                        case "insertImage":
                            return (
                                <ImageDialog
                                    onClose={handleDropdownClose}
                                    referenceElement={buttonRef.current}
                                    imageSourceContent={imageSourceContent}
                                />
                            );
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
