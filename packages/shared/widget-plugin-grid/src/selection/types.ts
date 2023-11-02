import { SelectionMultiValue, SelectionSingleValue } from "mendix";

export type SelectionType = "None" | "Single" | "Multi";

export type MultiSelectionStatus = "none" | "all" | "some";

export type SelectionStatus = "none" | "all" | "some" | "unknown";

export type WidgetSelectionProperty = SelectionSingleValue | SelectionMultiValue | string | undefined;
