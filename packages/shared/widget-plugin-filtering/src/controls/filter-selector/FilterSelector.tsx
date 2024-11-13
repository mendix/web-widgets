import classNames from "classnames";
import { createElement, useMemo } from "react";
import { useSelect, UseSelectPropGetters } from "downshift";
import { useFloating, autoUpdate } from "@floating-ui/react-dom";

interface Option {
    value: string;
    label: string;
}

interface FilterSelectorProps {
    ariaLabel?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
}

export function FilterSelector(props: FilterSelectorProps): React.ReactElement {
    const { open, buttonProps, listboxProps, getItemProps, selectedItem, highlightedIndex, floatingStyles } =
        useController(props);

    return (
        <div className="filter-selector">
            <div className="filter-selector-content">
                <button
                    className={classNames("btn btn-default filter-selector-button button-icon", props.value)}
                    {...buttonProps}
                >
                    &nbsp;
                </button>
                <ul
                    className={classNames("filter-selectors", { hidden: !open, visible: open })}
                    {...listboxProps}
                    style={floatingStyles}
                >
                    {open &&
                        props.options.map((item, index) => (
                            <li
                                className={classNames("filter-listitem", {
                                    "filter-selected": selectedItem?.value === item.value,
                                    "filter-highlighted": highlightedIndex === index
                                })}
                                key={item.value}
                                {...getItemProps({ item, index })}
                            >
                                <div className={classNames("filter-icon", item.value)} aria-hidden />
                                <div className="filter-label">{item.label}</div>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}

interface ViewProps {
    open: boolean;
    buttonProps: JSX.IntrinsicElements["button"];
    listboxProps: JSX.IntrinsicElements["ul"];
    getItemProps: UseSelectPropGetters<Option>["getItemProps"];
    selectedItem: Option | null;
    highlightedIndex: number;
    floatingStyles: React.CSSProperties;
}

function useController(props: FilterSelectorProps): ViewProps {
    const selectedItem = useMemo(
        () => props.options.find(item => item.value === props.value) ?? null,
        [props.options, props.value]
    );

    const { isOpen, highlightedIndex, getToggleButtonProps, getMenuProps, getItemProps } = useSelect({
        items: props.options,
        selectedItem,
        itemToString,
        onSelectedItemChange: ({ selectedItem }) => props.onChange(selectedItem.value)
    });

    const { refs, floatingStyles } = useFloating({
        open: isOpen,
        placement: "bottom-start",
        strategy: "fixed",
        whileElementsMounted: autoUpdate
    });

    const listboxLabel = props.ariaLabel || "Select filter type";
    const buttonLabel = selectedItem?.label || listboxLabel;
    const buttonProps = getToggleButtonProps({
        "aria-label": buttonLabel,
        ref: refs.setReference
    });
    const listboxProps = getMenuProps({
        "aria-label": listboxLabel,
        ref: refs.setFloating
    });

    return {
        open: isOpen,
        buttonProps,
        listboxProps,
        getItemProps,
        selectedItem,
        highlightedIndex,
        floatingStyles
    };
}

const itemToString = (item: Option | null): string => (item ? item.label : "");
