import classNames from "classnames";
import { Icon } from "mendix/components/web/Icon";
import { createElement, ReactElement } from "react";

export function ClearButton(): ReactElement {
    return (
        <span className="widget-combobox-icon-container">
            <Icon
                icon={{
                    type: "icon",
                    iconClass: classNames("widget-combobox-clear-button-icon", "mx-icon-lined", "mx-icon-remove")
                }}
            />
        </span>
    );
}

export function DownArrow({ isOpen }: { isOpen?: boolean }): ReactElement {
    return (
        <span className="widget-combobox-icon-container">
            <Icon
                icon={{
                    type: "icon",
                    iconClass: classNames("widget-combobox-down-arrow-icon", "mx-icon-lined", "mx-icon-chevron-down", {
                        active: isOpen
                    })
                }}
            />
        </span>
    );
}

export function Checkbox({ checked }: { checked: boolean | undefined }): ReactElement {
    return (
        <span className="widget-combobox-icon-container">
            <svg
                className={classNames("widget-combobox-down-checkbox-icon", {
                    checked
                })}
                width="24"
                height="20"
                viewBox="0 0 24 20"
            >
                {checked ? (
                    <rect x="2" width="20" height="20" rx="5" />
                ) : (
                    <rect x="2.5" y="0.5" width="19" height="19" rx="4.5" />
                )}
                <path d="M7 10.3077L10.6923 14L17.4615 6" />
            </svg>
        </span>
    );
}
