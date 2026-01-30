import { If } from "@mendix/widget-plugin-component-kit/If";
import { ReactElement } from "react";
import { useSelectionCounterViewModel } from "../features/selection-counter/injection-hooks";
import { SelectionCounter } from "../features/selection-counter/SelectionCounter";
import { usePaginationConfig } from "../model/hooks/injection-hooks";
import { Pagination } from "./Pagination";

export function GalleryTobBarControls(): ReactElement {
    const counterVM = useSelectionCounterViewModel();
    const pgConfig = usePaginationConfig();
    
    return (
        <div className="widget-gallery-top-bar-controls">
            <div className="widget-gallery-tb-start">
                <If condition={counterVM.isTopCounterVisible}>
                    <SelectionCounter />
                </If>
                <If condition={pgConfig.pagingPosition !== "bottom"}>
                    <div className="widget-gallery-tb-end">
                        <Pagination />
                    </div>
                </If>
            </div>
        </div>
    );
}
