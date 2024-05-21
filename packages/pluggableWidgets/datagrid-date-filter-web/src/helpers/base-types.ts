import { DefaultFilterEnum as FilterTypeEnum } from "../../typings/DatagridDateFilterProps";

export type { FilterTypeEnum };

export type InitValues = {
    type: FilterTypeEnum;
    value: Date | null;
    startDate: Date | null;
    endDate: Date | null;
};

// Personal gratitude to Marco Gonzalez
// For his `TypedEventTarget`
// https://dev.to/marcogrcr/type-safe-eventtarget-subclasses-in-typescript-1nkf

export type TypedEventTarget<EventMap extends object> = new () => IntermediateEventTarget<EventMap>;

// internal helper type
interface IntermediateEventTarget<EventMap> extends EventTarget {
    addEventListener<K extends keyof EventMap>(
        type: K,
        callback: (event: EventMap[K] extends Event ? EventMap[K] : never) => EventMap[K] extends Event ? void : never,
        options?: boolean | AddEventListenerOptions
    ): void;

    addEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: EventListenerOptions | boolean
    ): void;
}
