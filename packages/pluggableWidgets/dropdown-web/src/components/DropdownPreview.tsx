import classNames from "classnames";
import Downshift from "downshift";
import { createElement, ReactElement } from "react";
import { ClearButton, DownArrow } from "../assets/icons";
import { DropdownPreviewProps } from "../../typings/DropdownProps";
import "../ui/Dropdown.scss";

export function DropdownPreview(props: Partial<DropdownPreviewProps>): ReactElement {
    const backgroundColor = props.readOnly ? "#C8C8C8" : undefined;
    return (
        <Downshift>
            {({ getInputProps, isOpen, getToggleButtonProps }) => (
                <div className="widget-dropdown">
                    <div
                        style={{ backgroundColor }}
                        className={classNames("form-control", "widget-dropdown-input-container", {
                            active: isOpen
                        })}
                        {...getToggleButtonProps()}
                    >
                        <input
                            style={{ backgroundColor }}
                            className="widget-dropdown-input"
                            {...{ ...getInputProps() }}
                            placeholder={props.emptyOptionText}
                        />

                        {props.clearable && (
                            <button className="widget-dropdown-clear-button">
                                <ClearButton />
                            </button>
                        )}
                        <div className="widget-dropdown-down-arrow">
                            <DownArrow />
                        </div>
                    </div>
                </div>
            )}
        </Downshift>
    );
}
