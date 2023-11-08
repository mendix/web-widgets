import { createElement, ReactElement, memo, PropsWithChildren } from "react";
import {
    SelectionHelper,
    getGlobalSelectionContext,
    useCreateSelectionContextValue
} from "@mendix/widget-plugin-grid/selection";
import { MultiFilterRenderer } from "../typings/MultiFilterRenderer";

type WidgetHeaderContextProps = PropsWithChildren<{
    selectionHelper: SelectionHelper | undefined;
    filterRenderer: MultiFilterRenderer;
}>;

const component = memo(({ filterRenderer, children, selectionHelper }: WidgetHeaderContextProps) => {
    const { Provider: SelectionProvider } = getGlobalSelectionContext();
    return (
        <SelectionProvider value={useCreateSelectionContextValue(selectionHelper)}>
            {filterRenderer(children)}
        </SelectionProvider>
    );
});

component.displayName = "WidgetHeaderContext";

// Override NamedExoticComponent type
export const WidgetHeaderContext = component as (props: WidgetHeaderContextProps) => ReactElement;
