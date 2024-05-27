import { useRef, useState } from "react";
import { useOnResetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { FilterStore } from "./store/FilterStore";
import { FilterTypeEnum } from "./base-types";
import { FilterAPIClient } from "./filter-api-client/FilterAPIClient";

type ResetEventParams = Parameters<typeof useOnResetValueEvent>[0];

interface Props {
    name: string;
    filterAPIClient: FilterAPIClient | null;
    defaultFilter: FilterTypeEnum;
    defaultValue?: Date;
    defaultStartDate?: Date;
    defaultEndDate?: Date;
}

export function useReset(props: Props, filterStore: FilterStore): void {
    function computeResetState(): FilterStore["state"] {
        const { defaultFilter, defaultValue = null, defaultEndDate = null, defaultStartDate = null } = props;
        return defaultFilter === "between"
            ? {
                  filterType: "between",
                  value: [defaultStartDate, defaultEndDate]
              }
            : {
                  filterType: defaultFilter,
                  value: defaultValue
              };
    }

    const resetState = useRef(computeResetState);
    resetState.current = computeResetState;

    const [resetParams] = useState<ResetEventParams>(() => ({
        widgetName: props.name,
        parentChannelName: props.filterAPIClient?.parentChannelName,
        listener: (setDefault: boolean) => {
            if (setDefault) {
                filterStore.reset(resetState.current());
            } else {
                filterStore.reset();
            }
        }
    }));

    useOnResetValueEvent(resetParams);
}
