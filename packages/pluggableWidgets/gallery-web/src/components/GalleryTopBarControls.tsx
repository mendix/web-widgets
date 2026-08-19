import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { If } from "@mendix/widget-plugin-component-kit/If";
import { Pagination } from "./Pagination";
import { useSelectionCounterViewModel } from "../features/selection-counter/injection-hooks";
import { SelectionCounter } from "../features/selection-counter/SelectionCounter";
import { usePaginationConfig } from "../model/hooks/injection-hooks";

export const GalleryTopBarControls = observer(function GalleryTopBarControls(): ReactElement {
    const counterVM = useSelectionCounterViewModel();
    const pgConfig = usePaginationConfig();

    return (
        <div className="widget-gallery-top-bar-controls">
            <div className="widget-gallery-tb-start">
                <If condition={counterVM.isTopCounterVisible}>
                    <SelectionCounter />
                </If>
            </div>
            <div className="widget-gallery-tb-end">
                <If condition={pgConfig.pagingPosition !== "bottom"}>
                    <Pagination />
                </If>
            </div>
        </div>
    );
});
