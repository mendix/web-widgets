import classNames from "classnames";
import { ObjectItem } from "mendix";
import { createElement, ReactElement } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { useListItemInteractionProps } from "../helpers/useListItemInteractionProps";
import { ListOptionSelectionProps } from "@mendix/widget-plugin-grid/selection/useListOptionSelectionProps";

type ListItemProps = Omit<JSX.IntrinsicElements["div"], "ref" | "role"> & {
    helper: GalleryItemHelper;
    item: ObjectItem;
    selectionProps: ListOptionSelectionProps;
};

export function ListItem({ children, className, helper, item, selectionProps, ...rest }: ListItemProps): ReactElement {
    const interactionProps = useListItemInteractionProps(item, selectionProps);
    const clickable = helper.hasOnClick(item) || selectionProps.selectionType !== "None";

    return (
        <div
            {...rest}
            className={classNames(
                "widget-gallery-item",
                {
                    "widget-gallery-clickable": clickable,
                    "widget-gallery-selected": interactionProps["aria-selected"]
                },
                helper.itemClass(item)
            )}
            {...interactionProps}
        >
            {helper.render(item)}
        </div>
    );
}
