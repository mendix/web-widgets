import { useDownshiftSingleSelectProps } from "../../hooks/useDownshiftSingleSelectProps";
import { createElement, ReactElement, useRef, Fragment } from "react";
import { Selector } from "../../helpers/types";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { ClearButton } from "../../assets/icons";
import { useGetSelector } from "../../hooks/useGetSelector";
import { SingleSelectionMenu } from "./SingleSelectionMenu";
import { Placeholder } from "../Placeholder";
import { ComboboxWrapper } from "../ComboboxWrapper";
import classNames from "classnames";

export function SingleSelection(props: ComboboxContainerProps): ReactElement {
    const comboboxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const selector = useGetSelector(props) as Selector<string>;

    const {
        getInputProps,
        getToggleButtonProps,
        getItemProps,
        selectedItem,
        getMenuProps,
        reset,
        isOpen,
        highlightedIndex
    } = useDownshiftSingleSelectProps(selector, inputRef.current, props.onChangeEvent);

    if (selector.status === "unavailable") {
        return <Placeholder />;
    }

    return (
        <Fragment>
            <ComboboxWrapper
                ref={comboboxRef}
                isOpen={isOpen}
                readOnly={selector.readOnly}
                getToggleButtonProps={getToggleButtonProps}
            >
                <input
                    className={classNames("widget-combobox-input", {
                        "widget-combobox-input-nofilter": selector.options.filterType === "no"
                    })}
                    tabIndex={0}
                    ref={inputRef}
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
                comboboxSize={comboboxRef.current?.getBoundingClientRect()}
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
