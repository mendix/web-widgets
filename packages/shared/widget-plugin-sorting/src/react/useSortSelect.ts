import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { SingleSortController } from "../controllers/SingleSortController";
import { BasicSortStore, SortDirection } from "../types/store";

interface HookProps {
    emptyOptionCaption?: string;
    store: BasicSortStore;
}

interface Option {
    caption: string;
    value: string;
}

interface ControlProps {
    value: string | null;
    options: Option[];
    direction: SortDirection;
    onSelect: (value: string) => void;
    onDirectionClick: () => void;
}

export function useSortSelect(props: HookProps, store: BasicSortStore): ControlProps {
    const ctrl = useSetup(() => new SingleSortController({ store }));

    return {
        value: ctrl.selected,
        options: ctrl.options,
        direction: ctrl.direction,
        onSelect: ctrl.select,
        onDirectionClick: ctrl.toggleDirection
    };
}
