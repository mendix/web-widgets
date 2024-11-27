import { UseSelectPropGetters, useSelect as useDownshiftSelect } from "downshift";
import { useFloating, autoUpdate } from "@floating-ui/react-dom";
import { useMemo } from "react";

interface Option {
    value: string;
    label: string;
}

interface useSelectProps {
    ariaLabel?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
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

export function useSelect(props: useSelectProps): ViewProps {
    const selectedItem = useMemo(
        () => props.options.find(item => item.value === props.value) ?? null,
        [props.options, props.value]
    );

    const { isOpen, highlightedIndex, getToggleButtonProps, getMenuProps, getItemProps } = useDownshiftSelect({
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
