import { enableStaticRendering } from "mobx-react-lite";
enableStaticRendering(true);

import { FilterComponent } from "./components/FilterComponent";
import { withPreviewAdapter } from "./hocs/withPreviewAdapter";

export const preview = withPreviewAdapter(FilterComponent);

export function getPreviewCss(): string {
    return require("react-datepicker/dist/react-datepicker.css");
}
