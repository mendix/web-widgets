interface DynamicSelectOptionsInterface<T> {
    options: T[];
    // should support lazy loading
    isLoading: boolean; // ?
    // isFetched: boolean; // ?
    hasMore: boolean; // ?
    loadMore: () => void; //?
}

interface StaticSelectOptionsInterface<T> {
    options: T[];
}

export interface EnumBool_SingleSelectFilterInterface extends StaticSelectOptionsInterface<string> {
    type: "single";
    value: string | undefined;

    getCaption: (val: string) => string;

    reset(): void;
}

export interface EnumBool_MultiSelectFilterInterface extends StaticSelectOptionsInterface<string> {
    type: "multi";
    value: string[];

    getCaption: (val: string) => string;

    reset(): void;
}

export interface Association_SingleSelectFilterInterface extends DynamicSelectOptionsInterface<string> {
    type: "single";
    value: string | undefined;

    getCaption: (val: string) => string;

    reset(): void;
}

export interface Association_MultiSelectFilterInterface extends DynamicSelectOptionsInterface<string> {
    type: "multi";
    value: string;

    getCaption: (val: string) => string;

    reset(): void;
}

export type SelectFilterInterface =
    | EnumBool_SingleSelectFilterInterface
    | EnumBool_MultiSelectFilterInterface
    | Association_SingleSelectFilterInterface
    | Association_MultiSelectFilterInterface;
