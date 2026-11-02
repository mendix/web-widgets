import classNames from "classnames";
import { ReactElement } from "react";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { useComboboxClasses } from "../../hooks/useComboboxClasses";
import { Caption } from "../Caption";
import { legacy } from "../legacyModifiers";
import { OptionContent } from "../OptionContent";

export interface PlaceholderProps {
    vm: ComboboxViewModel;
}

/**
 * What the input area shows while nothing is typed: the selected caption, or in single mode the
 * selected option's custom content when the hint allows it in the input area. Laid out as a
 * block instead of one line of text while it holds custom content.
 */
export function Placeholder({ vm }: PlaceholderProps): ReactElement {
    const classes = useComboboxClasses();
    const multi = vm.mode === "multi";
    const custom = !multi && vm.hints.customContent === "everywhere";
    const isEmpty = multi ? vm.chips.length <= 0 : !vm.value;

    return (
        <div
            className={classNames(classes.placeholder, {
                [legacy.placeholderCustom]: custom,
                [legacy.placeholderEmpty]: isEmpty
            })}
            data-custom={custom || undefined}
            data-empty={isEmpty || undefined}
        >
            {multi ? (
                vm.selectedCaption
            ) : vm.selected ? (
                <OptionContent option={vm.selected} placement="input" customContent={vm.hints.customContent} />
            ) : (
                <Caption>{vm.selectedCaption}</Caption>
            )}
        </div>
    );
}
