import classNames from "classnames";
import { ObjectItem } from "mendix";
import { createElement, ReactElement } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";

type P = Omit<JSX.IntrinsicElements["div"], "ref" | "role">;

interface ListItemProps extends P {
    role?: "option" | "listitem";
    helper: GalleryItemHelper;
    item: ObjectItem;
}

export function ListItem({
    children,
    className,
    role = "listitem",
    helper,
    item,
    ...rest
}: ListItemProps): ReactElement {
    const selected = false;
    const clickable = false;

    return (
        <div
            className={classNames(
                "widget-gallery-item",
                {
                    "widget-gallery-clickable": clickable,
                    "widget-gallery-selected": selected
                },
                helper.itemClass(item)
            )}
            role={role}
            {...rest}
        >
            {helper.render(item)}
        </div>
    );
}
