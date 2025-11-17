import { ActionValue, ListValue, SelectionMultiValue, SelectionSingleValue } from "mendix";

export interface SelectionDynamicProps {
    selection: SelectionSingleValue | SelectionMultiValue;
    datasource: ListValue;
    onSelectionChange: ActionValue | undefined;
}
