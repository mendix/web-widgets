import { autoUpdate, useFloating } from "@floating-ui/react-dom";
import { UseSelectPropGetters, useSelect as useDownshiftSelect } from "downshift";
import { useCallback, useMemo } from "react";

interface Option {
    value: string;
    caption: string;
}

interface useSelectProps {
    ariaLabel?: string;
    onSelect: (value: string | null) => void;
    options: Option[];
    value: string;
}

interface ViewProps {
    open: boolean;
    triggerProps: JSX.IntrinsicElements["button"];
    listboxProps: JSX.IntrinsicElements["ul"];
    clearProps: JSX.IntrinsicElements["button"];
    getItemProps: UseSelectPropGetters<Option>["getItemProps"];
    selectedItem: Option | null;
    highlightedIndex: number;
    floatingStyles: React.CSSProperties;
}

export function useSelect(props: useSelectProps): ViewProps {
    const { onSelect } = props;
    const selectedItem = useMemo(
        () => props.options.find(item => item.value === props.value) ?? null,
        [props.options, props.value]
    );

    const { isOpen, highlightedIndex, getToggleButtonProps, getMenuProps, getItemProps } = useDownshiftSelect({
        items: props.options,
        selectedItem,
        itemToString,
        onSelectedItemChange: ({ selectedItem }) => props.onSelect(selectedItem.value)
    });

    const { refs, floatingStyles } = useFloating({
        open: isOpen,
        placement: "bottom-start",
        strategy: "fixed",
        whileElementsMounted: autoUpdate
    });

    const listboxLabel = props.ariaLabel || "Select filter type";
    const buttonLabel = selectedItem?.caption || listboxLabel;

    const buttonProps = getToggleButtonProps({
        "aria-label": buttonLabel,
        ref: refs.setReference,
        onKeyDown: event => {
            if (event.key === "Backspace" || event.key === "Delete") {
                onSelect(null);
            }
        }
    });

    const listboxProps = getMenuProps({
        "aria-label": listboxLabel,
        ref: refs.setFloating
    });

    const clearProps = {
        onClick: useCallback(() => onSelect(null), [onSelect])
    };

    return {
        open: isOpen,
        triggerProps: buttonProps,
        clearProps,
        listboxProps,
        getItemProps,
        selectedItem,
        highlightedIndex,
        floatingStyles
    };
}

const itemToString = (item: Option | null): string => (item ? item.caption : "");
