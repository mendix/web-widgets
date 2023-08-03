import { useDownshiftSingleSelectProps } from "../../hooks/useDownshiftSingleSelectProps";
import { createElement, ReactElement, useRef, useState, Fragment } from "react";
import { Selector } from "../../helpers/types";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { ClearButton } from "../../assets/icons";
import { useGetSelector } from "../../hooks/useGetSelector";
import { SingleSelectionMenu } from "./SingleSelectionMenu";
import { Placeholder } from "../Placeholder";
import { ComboboxWrapper } from "../ComboboxWrapper";

export function SingleSelection(props: ComboboxContainerProps): ReactElement {
    const comboboxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [_inputValue, setInputValue] = useState<string>("");
    const selector = useGetSelector(props) as Selector<string>;
    const { getInputProps, toggleMenu, getItemProps, selectedItem, getMenuProps, reset, isOpen, highlightedIndex } =
        useDownshiftSingleSelectProps(
            selector,
            inputRef.current,
            props.emptyOptionText?.value,
            setInputValue,
            props.onChangeEvent
        );
    const readOnly =
        (props.attributeBoolean?.readOnly || props.attributeEnumeration?.readOnly) ??
        props.attributeAssociation?.readOnly;

    if (selector.status === "unavailable") {
        return <Placeholder />;
    }

    return (
        <Fragment>
            <ComboboxWrapper ref={comboboxRef} isOpen={isOpen} readOnly={readOnly} toggleMenu={toggleMenu}>
                <input
                    className="widget-combobox-input"
                    tabIndex={0}
                    ref={inputRef}
                    {...getInputProps(
                        {
                            disabled: readOnly,
                            readOnly: props.filterType === "no"
                        },
                        { suppressRefError: true }
                    )}
                    placeholder={selectedItem ? selector.caption.get(selectedItem) : props.emptyOptionText?.value}
                />
                {!readOnly && selector.clearable && selector.currentValue !== null && (
                    <button
                        className="widget-combobox-clear-button"
                        onClick={e => {
                            e.stopPropagation();
                            selector.setValue(null);
                            reset();
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
