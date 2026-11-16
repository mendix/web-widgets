import classNames from "classnames";
import { ReactElement } from "react";
import { ComboboxOptionVM, ComboboxViewModel } from "../../core/ComboboxViewModel";
import { ComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { useComboboxClasses } from "../../hooks/useComboboxClasses";
import { Checkbox } from "../icons";
import { legacy } from "../legacyModifiers";
import { OptionContent } from "../OptionContent";

export interface OptionProps {
    vm: ComboboxViewModel;
    option: ComboboxOptionVM;
    index: number;
    /** From the Behavior: id, role, aria-selected, the state attributes, ref and the mouse handlers of the option. */
    optionProps: ReturnType<ComboboxBehavior["getOptionProps"]>;
}

/** One option in the menu: a checkbox when the multi-select selection method asks for one, then the content. */
export function Option({ vm, option, optionProps }: OptionProps): ReactElement {
    const classes = useComboboxClasses();
    const withCheckbox = vm.mode === "multi" && vm.hints.selectionMethod === "checkbox";
    const checkboxId = withCheckbox ? `${vm.id}_${option.id}` : undefined;

    return (
        <li
            className={classNames(classes.menuItem, {
                [legacy.itemSelected]: optionProps["data-selected"],
                [legacy.itemHighlighted]: optionProps["data-highlighted"]
            })}
            {...optionProps}
        >
            {withCheckbox && <Checkbox checked={option.selected} id={checkboxId} />}
            <OptionContent
                option={option}
                placement="menu"
                customContent={vm.hints.customContent}
                htmlFor={checkboxId}
            />
        </li>
    );
}
