import classNames from "classnames";
import Downshift from "downshift";
import { createElement, ReactElement } from "react";
import { ComboboxPreviewProps } from "../typings/ComboboxProps";
import { ClearButton, DownArrow } from "./assets/icons";
import { InputPlaceholder } from "./components/Placeholder";
import { getDatasourcePlaceholderText } from "./helpers/utils";
import "./ui/Combobox.scss";

export const preview = (props: ComboboxPreviewProps): ReactElement => {
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
                        <div className="widget-combobox-selected-items">
                            <input
                                style={{ backgroundColor }}
                                className="widget-combobox-input"
                                {...getInputProps()}
                                placeholder=" "
                            />
                            <InputPlaceholder isEmpty>{getDatasourcePlaceholderText(props)}</InputPlaceholder>
                        </div>
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
};
