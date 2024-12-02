import { createElement, useState, Fragment, useCallback } from "react";
import {
    useFloating,
    useClick,
    useDismiss,
    useRole,
    useInteractions,
    autoUpdate,
    FloatingFocusManager,
    FloatingContext
} from "@floating-ui/react";
import { Option } from "../../typings/OptionListFilterInterface";
import { ListSearch } from "./ListSearch";
import { SelectControl } from "../kit/SelectControl";

interface SelectPanelProps {
    options: Option[];
    value: string;
    placeholder?: string;
    onSelect: (value: string | null) => void;
    searchValue: string;
    onSearch: (value: string) => void;
    onTriggerClick?: () => void;
}

export function SelectPanel(props: SelectPanelProps): React.ReactElement {
    const placeholder = props.placeholder ?? "Select";
    const { triggerProps, dialogProps, isOpen, context, clearProps, setIsOpen } = useSelectPanel(props);
    return (
        <Fragment>
            <SelectControl triggerProps={triggerProps} clearProps={clearProps}>
                {props.value || placeholder}
            </SelectControl>
            {isOpen && (
                <FloatingFocusManager context={context} modal={false}>
                    <section className="select-dialog" {...dialogProps}>
                        <div className="header">
                            <h3>Select value</h3>
                        </div>
                        <div className="body">
                            <ListSearch
                                searchValue={props.searchValue}
                                options={props.options}
                                onSelect={props.onSelect}
                                onSearch={props.onSearch}
                                onSearchBlur={() => setIsOpen(false)}
                            />
                        </div>
                    </section>
                </FloatingFocusManager>
            )}
        </Fragment>
    );
}

interface ViewProps {
    triggerProps: JSX.IntrinsicElements["button"];
    dialogProps: JSX.IntrinsicElements["div"];
    clearProps: JSX.IntrinsicElements["button"];
    context: FloatingContext;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

function useSelectPanel(props: SelectPanelProps): ViewProps {
    const { onSelect } = props;
    const [isOpen, setIsOpen] = useState(false);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        whileElementsMounted: autoUpdate,
        placement: "bottom-start",
        strategy: "fixed"
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    const triggerProps = {
        ref: refs.setReference,
        ...getReferenceProps({
            onClick: props.onTriggerClick
        }),
        onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === "Backspace" || event.key === "Delete") {
                onSelect(null);
            }
        }
    };

    const dialogProps = {
        ref: refs.setFloating,
        style: floatingStyles,
        ...getFloatingProps()
    };

    const clearProps = {
        onClick: useCallback(() => onSelect(null), [onSelect])
    };

    return {
        dialogProps,
        triggerProps,
        context,
        isOpen,
        clearProps,
        setIsOpen
    };
}
