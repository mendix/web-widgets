import { SelectionMultiValue, SelectionSingleValue } from "mendix";
import { ItemSelectionMethodEnum } from "../../../typings/DatagridProps";
import { SelectionMethod } from "./base";

export function getSelectionMethod(
    method: ItemSelectionMethodEnum,
    selection?: SelectionSingleValue | SelectionMultiValue
): SelectionMethod {
    return selection ? method : "none";
}
