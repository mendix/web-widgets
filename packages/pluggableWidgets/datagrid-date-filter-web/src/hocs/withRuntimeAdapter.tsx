import { createElement } from "react";
import { FilterComponent } from "../components/FilterComponent";
import { APIv2Props } from "../helpers/filter-api-client/types";
import { useDefaultValues } from "../helpers/useDefaultValues";
import { InitValues } from "../helpers/base-types";
import { useSyncChannel } from "../helpers/useSyncChannel";

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
                syncChannel={useSyncChannel(props)}
                screenReaderButtonCaption={props.screenReaderButtonCaption?.value}
                screenReaderCalendarCaption={props.screenReaderCalendarCaption?.value}
                screenReaderInputCaption={props.screenReaderInputCaption?.value}
                initValues={useInitValues(props)}
                placeholder={props.placeholder?.value}
            />
        );
    };
}

function useInitValues(props: APIv2Props): InitValues {
    const dvs = useDefaultValues(props);
    return props.filterAPIClient.initValues ?? dvs;
}
