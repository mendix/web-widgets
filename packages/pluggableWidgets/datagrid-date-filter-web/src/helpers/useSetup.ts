import { useState } from "react";
import { DatePickerController } from "./DatePickerController";
import { InitValues } from "./base-types";
import { FilterAPIClient } from "./filter-api-client/FilterAPIClient";
import { ChangeEventHandler, FilterStore } from "./store/FilterStore";
import { CalendarStore } from "./store/CalendarStore";
import { useNewStore } from "./store/useNewStore";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { SyncChannel } from "./SyncChannel";

export interface SetupProps {
    filterAPIClient: FilterAPIClient | null;
    syncChannel: SyncChannel | null;
    initValues?: InitValues;
}

type SetupResult = {
    calendarStore: CalendarStore;
    filterStore: FilterStore;
    datePickerController: DatePickerController;
    id: string;
};

const defaultValues: InitValues = {
    type: "equal",
    value: null,
    startDate: null,
    endDate: null
};

export function useSetup(props: SetupProps): SetupResult {
    const calendarStore = useNewStore(() => new CalendarStore());
    const filterStore = useNewStore(() => {
        const { type, value, startDate, endDate } = props.initValues ?? defaultValues;
        const initState: FilterStore["state"] =
            type === "between"
                ? {
                      filterType: "between",
                      value: [startDate, endDate]
                  }
                : {
                      filterType: type,
                      value
                  };
        return new FilterStore(initState);
    });

    const [datePickerController] = useState(() => new DatePickerController(filterStore, calendarStore));

    // Setup all the reactions/watches/effects;
    const [result] = useState<SetupResult>(() => {
        const { syncChannel, filterAPIClient } = props;

        if (filterAPIClient) {
            connectFilterAPI(filterAPIClient, filterStore);
        }

        if (syncChannel) {
            setupSync(syncChannel, filterStore);
        }

        return {
            calendarStore,
            filterStore,
            datePickerController,
            id: `DateFilter${generateUUID()}`
        };
    });

    return result;
}

function connectFilterAPI(client: FilterAPIClient, store: FilterStore): void {
    const handleChange: ChangeEventHandler = event => {
        const { detail: state } = event;
        client.dispatch(state.filterType, state.value);
    };

    store.addEventListener("change", handleChange);
    store.addEventListener("init", handleChange);
}

function setupSync(channel: SyncChannel, store: FilterStore): void {
    store.addEventListener("change", event => channel.push(event.detail.value));
}
