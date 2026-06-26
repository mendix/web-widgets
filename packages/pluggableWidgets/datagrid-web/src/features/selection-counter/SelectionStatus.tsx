import { observer } from "mobx-react-lite";
import { ReactElement } from "react";

export interface SelectionStatusViewModel {
    selectionStatus: string;
    isVisible: boolean;
}

/**
 * SelectionStatus component renders an ARIA live region that announces
 * selection state changes to screen readers.
 *
 * Uses role="status" (WCAG 4.1.3 Status Messages) which provides:
 * - aria-live="polite" (non-interrupting announcements)
 * - aria-atomic="true" (announces complete message)
 *
 * The region is visually hidden but accessible to assistive technology.
 */
export const SelectionStatus = observer(function SelectionStatus({
    viewModel
}: {
    viewModel: SelectionStatusViewModel;
}): ReactElement | null {
    if (!viewModel.isVisible) {
        return null;
    }

    return (
        <div role="status" className="sr-only">
            {viewModel.selectionStatus}
        </div>
    );
});
