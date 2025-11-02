import { ListValue, SelectionMultiValue, SelectionSingleValue } from "mendix";

export type SelectAllGateProps = {
    datasource: ListValue;
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
};
