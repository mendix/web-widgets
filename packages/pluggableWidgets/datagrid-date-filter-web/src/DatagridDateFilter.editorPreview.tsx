import { enableStaticRendering } from "mobx-react-lite";
enableStaticRendering(true);

import { DateFilterComponent } from "@mendix/widget-plugin-filtering/controls/date-picker/DateFilterComponent";
import { withPreviewAdapter } from "./hocs/withPreviewAdapter";

export const preview = withPreviewAdapter(DateFilterComponent);

export function getPreviewCss(): string {
    return require("react-datepicker/dist/react-datepicker.css");
}
