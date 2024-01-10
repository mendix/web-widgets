import classNames from "classnames";
import { ObjectItem } from "mendix";
import { createElement, DOMAttributes, forwardRef, memo, ReactElement } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { useListItemInteractionProps } from "../helpers/useListItemInteractionProps";
import { ListOptionSelectionProps } from "@mendix/widget-plugin-grid/selection/useListOptionSelectionProps";
import { useFocusTargetProps } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetProps";
import { Positions } from "src/features/keyboard-navigation/useGridPositions";

type ListItemProps = Omit<JSX.IntrinsicElements["div"], "ref" | "role"> & {
    getPosition: (index: number) => Positions;
    helper: GalleryItemHelper;
    item: ObjectItem;
    itemIndex: number;
    selectionProps: ListOptionSelectionProps;
    onClick?: DOMAttributes<HTMLDivElement>["onClick"];
    onKeyDown?: DOMAttributes<HTMLDivElement>["onKeyDown"];
    tabIndex?: number;
};

const component = memo(
    // eslint-disable-next-line prefer-arrow-callback
    forwardRef<HTMLDivElement>(function ListItem(
        { children, className, helper, item, selectionProps, ...rest }: ListItemProps,
        ref
    ): ReactElement {
        const interactionProps = useListItemInteractionProps(item, selectionProps);
        const clickable = helper.hasOnClick(item) || selectionProps.selectionType !== "None";

        return (
            <div
                className={classNames(
                    "widget-gallery-item",
                    {
                        "widget-gallery-clickable": clickable,
                        "widget-gallery-selected": interactionProps["aria-selected"]
                    },
                    helper.itemClass(item)
                )}
                ref={ref}
                {...interactionProps}
                {...rest}
            >
                {helper.render(item)}
            </div>
        );
    })
);

export function ListItem(props: ListItemProps): ReactElement {
    const ListItemComponent = component as (props: ListItemProps) => ReactElement;
    const { columnIndex, rowIndex } = props.getPosition(props.itemIndex);
    const keyNavProps = useFocusTargetProps({ columnIndex: columnIndex ?? -1, rowIndex });

    return <ListItemComponent {...props} {...keyNavProps} />;
}
