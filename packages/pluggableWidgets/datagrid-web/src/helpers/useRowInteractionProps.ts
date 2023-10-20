import { SelectionType } from "@mendix/widget-plugin-grid/selection";
import { GridSelectionProps } from "@mendix/widget-plugin-grid/selection/useGridSelectionProps";
import { removeAllRanges } from "@mendix/widget-plugin-grid/selection/utils";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ListActionValue, ObjectItem } from "mendix";
import { useMemo } from "react";
import { OnClickTriggerEnum } from "typings/DatagridProps";

/**
 * This is sad, but originally row was behaving like a button when DG has a "On click" action.
 * For this case, there is still no good a11y pattern:
 * Discussion 1 - https://github.com/mu-semtech/ember-data-table/issues/20
 * Discussion 2 - https://github.com/dequelabs/axe-core/issues/1942
 * But, maybe that will change in the future?
 * For RowActAsButton, please check https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction
 * For RowActAsSelectable, please check https://www.w3.org/WAI/ARIA/apg/patterns/grid/#datagridsforpresentingtabularinformation
 */
type RowPattern = "RowActAsButton" | "RowActAsSelectable" | "None";

type OtherProps = {
    cellClickableClass: boolean;
};

type RowEventHandlers = {
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    onKeyUp?: React.KeyboardEventHandler<HTMLDivElement>;
};

type ActionProp = ListActionValue | undefined;

type RowInteractionProps = RowEventHandlers;

function getPattern(selectionType: SelectionType, action: ActionProp): RowPattern {
    if (selectionType === "Single" || selectionType === "Multi") {
        return "RowActAsSelectable";
    }

    if (action) {
        return "RowActAsButton";
    }

    return "None";
}

function rowPropsButton(item: ObjectItem, actionTrigger: OnClickTriggerEnum, action: ActionProp): RowInteractionProps {
    const callback = (): void => executeAction(action?.get(item));
    const callbackSingle = actionTrigger === "single" ? callback : undefined;
    const callbackDouble = actionTrigger === "double" ? callback : undefined;

    return {
        onClick: callbackSingle,
        onDoubleClick: callbackDouble,
        onKeyUp(event) {
            if (event.code !== "Enter" && event.code !== "Space") {
                return;
            }

            if (isDirectChild(event.currentTarget, event.target as Element)) {
                callback();
            }
        }
    };
}

function rowPropsSelectable(
    item: ObjectItem,
    selectionProps: GridSelectionProps,
    actionTrigger: OnClickTriggerEnum,
    action: ActionProp
): RowInteractionProps {
    const callbackSingle = (item: ObjectItem, shiftKey: boolean): void => selectionProps.onSelect(item, shiftKey);
    const callbackDouble = actionTrigger === "double" ? () => executeAction(action?.get(item)) : undefined;

    return {
        onClick(event) {
            if (event.shiftKey) {
                removeAllRanges();
            }
            callbackSingle(item, event.shiftKey);
        },
        onDoubleClick: callbackDouble,
        onKeyDown: selectionProps.onKeyDown,
        onKeyUp(event) {
            selectionProps.onKeyUp?.(event, item);
        }
    };
}

function isDirectChild(row: Element, cell: Element): boolean {
    return Array.from(row.children).includes(cell);
}

export function useRowInteractionProps(
    item: ObjectItem,
    selectionProps: GridSelectionProps,
    actionTrigger: OnClickTriggerEnum,
    action: ActionProp
): [RowInteractionProps, OtherProps] {
    function computeProps(): [RowInteractionProps, OtherProps] {
        const pattern = getPattern(selectionProps.selectionType, action);
        let props: RowInteractionProps = {};

        if (pattern === "RowActAsButton") {
            props = rowPropsButton(item, actionTrigger, action);
        }

        if (pattern === "RowActAsSelectable") {
            props = rowPropsSelectable(item, selectionProps, actionTrigger, action);
        }

        return [props, { cellClickableClass: pattern !== "None" }];
    }

    return useMemo(computeProps, [item, selectionProps, actionTrigger, action]);
}
