import { createElement } from "react";
import { FilterComponent } from "../components/FilterComponent";
import { APIv2Props } from "../helpers/filter-api-client/types";

type RuntimeAdapter = (props: APIv2Props) => React.ReactElement;

export function withRuntimeAdapter(Component: FilterComponent): RuntimeAdapter {
    return function RuntimeAdapter(props) {
        return (
            <Component
                name={props.name}
                defaultFilter={props.defaultFilter}
                defaultValue={props.defaultValue?.value}
                defaultStartDate={props.defaultStartDate?.value}
                defaultEndDate={props.defaultEndDate?.value}
                adjustable={props.adjustable}
                class={props.class}
                tabIndex={props.tabIndex ?? 0}
                style={props.style}
                filterAPIClient={props.filterAPIClient}
                screenReaderButtonCaption={props.screenReaderButtonCaption?.value}
                screenReaderCalendarCaption={props.screenReaderCalendarCaption?.value}
                screenReaderInputCaption={props.screenReaderInputCaption?.value}
            />
        );
    };
}
