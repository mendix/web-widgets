import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { useEmptyPlaceholderVM } from "./injection-hooks";

export const EmptyPlaceholder = observer(function EmptyPlaceholder(): ReactNode {
    const vm = useEmptyPlaceholderVM();

    if (!vm.content) return null;

    return (
        <div className={classNames("td", "td-borders")} style={vm.style}>
            <div className="empty-placeholder">{vm.content}</div>
        </div>
    );
});
