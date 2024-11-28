import { createElement, useState, Fragment } from "react";
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
import { ListBoxWithSearch } from "./ListBoxWithSearch";

interface SelectPanelProps {
    options: Option[];
    value: string;
    searchValue: string;
    onSelect: (value: string) => void;
    onSearch: (value: string) => void;
}
export function SelectPanel(props: SelectPanelProps): React.ReactElement {
    const { triggerProps, dialogProps, isOpen, context } = useSelectPanel(props);
    return (
        <Fragment>
            <div className="select-panel-control form-control">
                <button {...triggerProps} className="trigger">
                    {triggerProps.children}
                    <span aria-hidden>&#8595;</span>
                </button>
                <button className="clear" aria-hidden tabIndex={-1}>
                    x
                </button>
            </div>
            {isOpen && (
                <FloatingFocusManager context={context} modal>
                    <section className="select-panel-dialog" {...dialogProps}>
                        <div className="header">
                            <h3>Select value</h3>
                        </div>
                        <div className="body">
                            <ListBoxWithSearch
                                searchValue={props.searchValue}
                                options={props.options}
                                onSelect={props.onSelect}
                                onSearch={props.onSearch}
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
    context: FloatingContext;
    isOpen: boolean;
}

function useSelectPanel(props: { value: string }): ViewProps {
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
        ...getReferenceProps(),
        children: props.value || "Select"
    };

    const dialogProps = {
        ref: refs.setFloating,
        style: floatingStyles,
        ...getFloatingProps()
    };

    return {
        dialogProps,
        triggerProps,
        context,
        isOpen
    };
}
