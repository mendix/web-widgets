import classNames from "classnames";
import { ReactElement } from "react";
import { ClearButton } from "../../assets/icons";
import { ComboboxOptionVM, ComboboxViewModel } from "../../core/ComboboxViewModel";
import { ComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { useComboboxClasses } from "../../hooks/useComboboxClasses";
import { legacy } from "../legacyModifiers";
import { OptionContent } from "../OptionContent";

export interface ChipProps {
    vm: ComboboxViewModel;
    chip: ComboboxOptionVM;
    index: number;
    /** From the Behavior: ref, keyboard focus state and handlers of the chip. */
    chipProps: ReturnType<ComboboxBehavior["getChipProps"]>;
    /** From the Behavior: role, label and click handler of the remove control. */
    removeProps: ReturnType<ComboboxBehavior["getChipRemoveProps"]>;
}

/** One selected item in a multi-select with the "boxes" style, with its remove control. */
export function Chip({ vm, chip, chipProps, removeProps }: ChipProps): ReactElement {
    const classes = useComboboxClasses();

    return (
        <div className={classes.chip} {...chipProps}>
            <OptionContent option={chip} placement="input" customContent={vm.hints.customContent} />
            {!vm.readOnly && (
                <span className={classNames("icon", legacy.chipRemove, classes.chipRemove)} {...removeProps}>
                    <ClearButton size={10} />
                </span>
            )}
        </div>
    );
}
