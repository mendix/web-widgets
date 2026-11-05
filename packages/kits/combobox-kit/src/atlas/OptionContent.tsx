import { ReactElement } from "react";
import { Caption } from "./Caption";
import { ComboboxHints, ComboboxOptionVM } from "../core/ComboboxViewModel";
import { useComboboxClasses } from "../hooks/useComboboxClasses";

export type ContentPlacement = "menu" | "input";

interface OptionContentProps {
    option: ComboboxOptionVM;
    placement: ContentPlacement;
    customContent: ComboboxHints["customContent"];
    /** A menu with checkboxes: the caption labels the option's checkbox. */
    htmlFor?: string;
}

/**
 * The custom content of an option where `hints.customContent` allows it for the placement, the
 * plain caption otherwise. Placement is the View's decision; the Core only carries the content.
 */
export function OptionContent({ option, placement, customContent, htmlFor }: OptionContentProps): ReactElement {
    const classes = useComboboxClasses();
    const custom =
        option.content !== undefined &&
        (customContent === "everywhere" || (customContent === "menuOnly" && placement === "menu"));
    return custom ? (
        <div className={classes.customContent}>{option.content}</div>
    ) : (
        <Caption htmlFor={htmlFor}>{option.caption}</Caption>
    );
}
