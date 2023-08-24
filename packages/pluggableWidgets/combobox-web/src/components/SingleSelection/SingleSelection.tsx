import { useDownshiftSingleSelectProps } from "../../hooks/useDownshiftSingleSelectProps";
import { createElement, ReactElement, Fragment } from "react";
import { SingleSelector } from "../../helpers/types";
import { ClearButton } from "../../assets/icons";
import { SingleSelectionMenu } from "./SingleSelectionMenu";
import { Placeholder } from "../Placeholder";
import { ComboboxWrapper } from "../ComboboxWrapper";
import classNames from "classnames";

interface SingleSelectionProps {
    selector: SingleSelector;
    tabIndex: number;
    inputId?: string;
    labelId?: string;
}

export function SingleSelection({ selector, tabIndex = 0, ...options }: SingleSelectionProps): ReactElement {
    const {
        getInputProps,
        getToggleButtonProps,
        getItemProps,
        selectedItem,
        getMenuProps,
        reset,
        isOpen,
        highlightedIndex
    } = useDownshiftSingleSelectProps(selector, options);

    if (selector.status === "unavailable") {
        return <Placeholder />;
    }

    return (
        <Fragment>
            <ComboboxWrapper isOpen={isOpen} readOnly={selector.readOnly} getToggleButtonProps={getToggleButtonProps}>
                <input
                    className={classNames("widget-combobox-input", {
                        "widget-combobox-input-nofilter": selector.options.filterType === "no"
                    })}
                    tabIndex={tabIndex}
                    {...getInputProps(
                        {
                            disabled: selector.readOnly,
                            readOnly: selector.options.filterType === "no"
                        },
                        { suppressRefError: true }
                    )}
                    placeholder={selector.caption.get(selectedItem)}
                />
                {!selector.readOnly && selector.clearable && selector.currentValue !== null && (
                    <button
                        tabIndex={tabIndex}
                        className="widget-combobox-clear-button"
                        onClick={e => {
                            e.stopPropagation();
                            if (selectedItem) {
                                selector.setValue(null);
                                reset();
                            }
                        }}
                    >
                        <ClearButton />
                    </button>
                )}
            </ComboboxWrapper>
            <SingleSelectionMenu
                selector={selector}
                selectedItem={selectedItem}
                getMenuProps={getMenuProps}
                getItemProps={getItemProps}
                isOpen={isOpen}
                highlightedIndex={highlightedIndex}
            />
        </Fragment>
    );
}
