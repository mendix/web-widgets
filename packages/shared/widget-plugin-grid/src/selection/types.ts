import { SelectionMultiValue, SelectionSingleValue, ObjectItem } from "mendix";

export type SelectionType = "None" | "Single" | "Multi";

export type MultiSelectionStatus = "none" | "all" | "some";

export type SelectionStatus = "none" | "all" | "some" | "unknown";

export type WidgetSelectionProperty = SelectionSingleValue | SelectionMultiValue | string | undefined;

export type SelectFx = (item: ObjectItem, shiftKey: boolean, toggle?: boolean) => void;

export type SelectAllFx = (requestedAction?: "selectAll" | "deselectAll") => void;

export type Direction = "forward" | "backward" | "pageup" | "pagedown" | "home" | "end";

export type Size = number | "edge";

export type SelectAdjacentFx = (
    item: ObjectItem,
    shiftKey: boolean,
    direction: Direction,
    size: Size,
    mode: SelectionMode
) => void;

export type SelectAdjacentInGridFx = (
    item: ObjectItem,
    shiftKey: boolean,
    direction: Direction,
    size: Size,
    numberOfColumns?: number
) => void;

/**
 * Selection mode enum.
 * `toggle` is additive mode where each
 * new item adds to selection. `clear` is a reducing mode where
 * newer selection overrides previous.
 */
export type SelectionMode = "toggle" | "clear";
