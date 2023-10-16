import classNames from "classnames";
import { ObjectItem } from "mendix";
import { createElement, ReactElement } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { getAriaSelected, getRole, useListItemInteractionProps } from "../helpers/useListItemInteractionProps";
import { ListOptionSelectionProps } from "@mendix/widget-plugin-grid/selection/useListOptionSelectionProps";

type ListItemProps = Omit<JSX.IntrinsicElements["div"], "ref" | "role"> & {
    helper: GalleryItemHelper;
    item: ObjectItem;
    selectionProps: ListOptionSelectionProps;
};

export function ListItem({ children, className, helper, item, selectionProps, ...rest }: ListItemProps): ReactElement {
    const interactionProps = useListItemInteractionProps(item, selectionProps);
    const selected = selectionProps.isSelected(item);
    const clickable = helper.hasOnClick(item) || selectionProps.selectionType !== "None";
    const ariaSelected = getAriaSelected(selectionProps.selectionType, selected);
    const role = getRole(selectionProps.selectionType);
    const tabIndex = selectionProps.selectionType !== "None" ? 0 : undefined;

    return (
        <div
            {...rest}
            className={classNames(
                "widget-gallery-item",
                {
                    "widget-gallery-clickable": clickable,
                    "widget-gallery-selected": selected
                },
                helper.itemClass(item)
            )}
            role={role}
            aria-selected={ariaSelected}
            tabIndex={tabIndex}
            {...interactionProps}
        >
            {helper.render(item)}
        </div>
    );
}
