import classNames from "classnames";
import { PropsWithChildren, ReactElement, Ref } from "react";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { ComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { useComboboxClasses } from "../../hooks/useComboboxClasses";
import { legacy } from "../legacyModifiers";

export interface InputContainerProps extends PropsWithChildren {
    vm: ComboboxViewModel;
    isOpen: boolean;
    /** From the Behavior: the id and the click handler go on the container, which is what opens the menu. */
    toggleProps: ReturnType<ComboboxBehavior["getToggleProps"]>;
    /** The popover's reference element. */
    anchorRef: Ref<HTMLDivElement>;
    /** Multi mode: something is selected, so the closed input collapses next to the chips or the text. */
    hasSelection: boolean;
}

/** The form-control box: the input area, the clear button and the toggle are its children. */
export function InputContainer({
    vm,
    isOpen,
    toggleProps,
    anchorRef,
    hasSelection,
    children
}: InputContainerProps): ReactElement {
    const classes = useComboboxClasses();
    const { id, onClick } = toggleProps;
    const textOnly = vm.readOnly && vm.hints.readOnlyStyle === "text";

    return (
        <div
            ref={anchorRef}
            tabIndex={-1}
            className={classNames(classes.inputContainer, {
                [legacy.containerOpen]: isOpen,
                [legacy.containerDisabled]: vm.readOnly,
                "form-control-static": textOnly,
                "form-control": !textOnly,
                [legacy.containerHasSelection]: hasSelection
            })}
            id={id}
            onClick={onClick}
            data-open={isOpen || undefined}
            data-disabled={vm.readOnly || undefined}
            data-has-selection={hasSelection || undefined}
        >
            {children}
        </div>
    );
}
