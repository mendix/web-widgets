import { createElement, useMemo } from "react";
import { FilterComponent } from "../components/FilterComponent";
import { DatagridDateFilterPreviewProps } from "../../typings/DatagridDateFilterProps";

type PreviewAdapter = (props: DatagridDateFilterPreviewProps) => React.ReactElement;

export function withPreviewAdapter(Component: FilterComponent): PreviewAdapter {
    return function PreviewAdapter(props) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const key = useMemo(() => Math.random(), [props.adjustable, props.defaultFilter]);

        return (
            <Component
                key={key}
                adjustable={props.adjustable}
                class={props.class}
                placeholder={props.placeholder}
                style={props.styleObject}
                tabIndex={0}
                onChange={() => {}}
                onFilterChange={() => {}}
                expanded={false}
                filterFn={props.defaultFilter}
            />
        );
    };
}
