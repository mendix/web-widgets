import { observer } from "mobx-react-lite";
import { useSelectionCounterTexts } from "./injection-hooks";

export const SelectionAriaLive = observer(function SelectionAriaLive() {
    const texts = useSelectionCounterTexts();

    return (
        <span className="sr-only" aria-live="polite" aria-atomic="true">
            {texts.selectedCountText}
        </span>
    );
});
