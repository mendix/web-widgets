import { useDownshiftSingleSelectProps } from "../../hooks/useDownshiftSingleSelectProps";
import { createElement, ReactElement, useRef, useState, Fragment } from "react";
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
    const [_inputValue, setInputValue] = useState<string>("");
    const noFilter = props.filterType === "no";
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
    } = useDownshiftSingleSelectProps(selector, setInputValue, inputRef.current, props.onChangeEvent);
    const readOnly =
        (props.attributeBoolean?.readOnly || props.attributeEnumeration?.readOnly) ??
        props.attributeAssociation?.readOnly;

    if (selector.status === "unavailable") {
        return <Placeholder />;
    }

    return (
        <Fragment>
            <ComboboxWrapper
                ref={comboboxRef}
                isOpen={isOpen}
                readOnly={readOnly}
                getToggleButtonProps={getToggleButtonProps}
            >
                <input
                    className={classNames("widget-combobox-input", { "widget-combobox-input-nofilter": noFilter })}
                    tabIndex={0}
                    ref={inputRef}
                    {...getInputProps(
                        {
                            disabled: readOnly,
                            readOnly: props.filterType === "no"
                        },
                        { suppressRefError: true }
                    )}
                    placeholder={selectedItem ? selector.caption.get(selectedItem) : selector.caption.emptyCaption}
                />
                {!readOnly && selector.clearable && selector.currentValue !== null && (
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
                filterType={props.filterType}
                selectedItem={selectedItem}
                getMenuProps={getMenuProps}
                getItemProps={getItemProps}
                isOpen={isOpen}
                highlightedIndex={highlightedIndex}
            />
        </Fragment>
    );
}
