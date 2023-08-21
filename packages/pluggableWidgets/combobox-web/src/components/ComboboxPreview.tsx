import classNames from "classnames";
import Downshift from "downshift";
import { createElement, ReactElement } from "react";
import { ClearButton, DownArrow } from "../assets/icons";
import { ComboboxPreviewProps } from "../../typings/ComboboxProps";
import "../ui/Combobox.scss";

export function ComboboxPreview(props: Partial<ComboboxPreviewProps>): ReactElement {
    const backgroundColor = props.readOnly ? "#C8C8C8" : undefined;
    return (
        <Downshift>
            {({ getInputProps, isOpen, getToggleButtonProps }) => (
                <div className="widget-combobox">
                    <div
                        style={{ backgroundColor }}
                        className={classNames("form-control", "widget-combobox-input-container", {
                            "widget-combobox-input-container-active": isOpen
                        })}
                        {...getToggleButtonProps()}
                    >
                        <input
                            style={{ backgroundColor }}
                            className="widget-combobox-input"
                            {...{ ...getInputProps() }}
                            placeholder={props.emptyOptionText}
                        />

                        {props.clearable && (
                            <button className="widget-combobox-clear-button">
                                <ClearButton />
                            </button>
                        )}
                        <div className="widget-combobox-down-arrow">
                            <DownArrow />
                        </div>
                    </div>
                </div>
            )}
        </Downshift>
    );
}
