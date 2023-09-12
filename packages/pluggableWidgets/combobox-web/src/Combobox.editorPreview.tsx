import { createElement, ReactElement } from "react";
import { ComboboxPreviewProps } from "../typings/ComboboxProps";
import classNames from "classnames";
import Downshift from "downshift";
import { ClearButton, DownArrow } from "./assets/icons";
import { InputPlaceholder } from "./components/Placeholder";
import "./ui/Combobox.scss";

function getDesignModePlaceholderText(args: ComboboxPreviewProps): string | undefined {
    const {
        optionsSourceType,
        optionsSourceAssociationDataSource,
        attributeEnumeration,
        attributeBoolean,
        emptyOptionText
    } = args;
    let returnVal: string | undefined = "";
    switch (optionsSourceType) {
        case "association":
            returnVal = (optionsSourceAssociationDataSource as { caption?: string })?.caption;
            break;
        case "enumeration":
            returnVal = `[${optionsSourceType}, ${attributeEnumeration}]`;
            break;
        case "boolean":
            returnVal = `[${optionsSourceType}, ${attributeBoolean}]`;
            break;
        default:
            returnVal = `[${emptyOptionText}]`;
    }

    return returnVal;
}

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
                            <InputPlaceholder isEmpty>{getDesignModePlaceholderText(props)}</InputPlaceholder>
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
