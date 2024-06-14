import { useRef, useState } from "react";
import { useOnResetValueEvent, useOnSetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { FilterStore } from "./store/FilterStore";
import { FilterTypeEnum } from "./base-types";
import { FilterAPIClient } from "./filter-api-client/FilterAPIClient";
import { SetFilterValueArgs } from "@mendix/widget-plugin-external-events/typings";

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

    const reset = (setDefault: boolean): void => {
        if (setDefault) {
            filterStore.reset(resetState.current());
        } else {
            filterStore.reset();
        }
    };

    const [resetParams] = useState<ResetEventParams>(() => ({
        widgetName: props.name,
        parentChannelName: props.filterAPIClient?.parentChannelName,
        listener: reset
    }));

    useOnSetValueEvent({
        widgetName: props.name,
        listener: (useDefaultValue: boolean, valueOptions: SetFilterValueArgs): void => {
            if (useDefaultValue) {
                reset(useDefaultValue);
            } else {
                const filterType = valueOptions.operators as FilterTypeEnum;
                filterStore.setType(filterType);
                filterStore.setValue(
                    filterType === "between"
                        ? [valueOptions.dateTimeValue, valueOptions.dateTimeValue2]
                        : valueOptions.dateTimeValue
                );
            }
        }
    });

    useOnResetValueEvent(resetParams);
}
