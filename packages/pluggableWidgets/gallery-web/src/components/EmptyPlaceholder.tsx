import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { useEmptyPlaceholderVM } from "../model/hooks/injection-hooks";

export const EmptyPlaceholder = observer(function EmptyPlaceholder(): ReactNode {
    const vm = useEmptyPlaceholderVM();

    if (!vm.content) return null;

    return (
        <section className="widget-gallery-empty" aria-label={vm.sectionAriaLabel}>
            <div className="empty-placeholder">{vm.content}</div>
        </section>
    );
});
