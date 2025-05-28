import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useState, createElement } from "react";
import { FilterOptionsType } from "../../typings/DatagridDropdownFilterProps";
import { StaticSelectFilterStore } from "@mendix/widget-plugin-filtering/stores/picker/StaticSelectFilterStore";

interface Props {
    filterStore: StaticSelectFilterStore;
    filterOptions: FilterOptionsType[];
}

export function withCustomOptionsGuard<P extends Props>(
    Component: (props: P) => React.ReactElement
): (props: P) => React.ReactElement {
    return function CustomOptionsGuard(props) {
        const [error] = useState((): Error | null => {
            for (const opt of props.filterOptions) {
                const value = `${opt.value?.value}`;
                if (!props.filterStore.isValidValue(value)) {
                    return new Error(`Invalid option value: '${value}'`);
                }
            }
            return null;
        });

        if (error) {
            return <Alert bootstrapStyle="danger">{error.message}</Alert>;
        }

        return <Component {...props} />;
    };
}
