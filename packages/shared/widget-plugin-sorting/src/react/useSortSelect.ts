import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { SingleSortController } from "../controllers/SingleSortController";
import { BasicSortStore, SortDirection } from "../types/store";

interface HookProps {
    emptyOptionCaption?: string;
    sortStore: BasicSortStore;
}

interface ControlProps {
    value: string | null;
    options: Array<{
        caption: string;
        value: string;
    }>;
    direction: SortDirection;
    onSelect: (value: string) => void;
    onDirectionClick: () => void;
}

export function useSortSelect(props: HookProps): ControlProps {
    const ctrl = useSetup(
        () => new SingleSortController({ store: props.sortStore, emptyOptionCaption: props.emptyOptionCaption })
    );

    return {
        value: ctrl.selected,
        options: ctrl.options,
        direction: ctrl.direction,
        onSelect: ctrl.select,
        onDirectionClick: ctrl.toggleDirection
    };
}
