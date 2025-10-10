import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { withSortAPI } from "@mendix/widget-plugin-sorting/react/hocs/withSortAPI";
import { ReactElement } from "react";
import { DropdownSortPreviewProps } from "../typings/DropdownSortProps";
import { SortComponent } from "./components/SortComponent";

const DropdownPreview = withSortAPI(SortComponent);

export function preview(props: DropdownSortPreviewProps): ReactElement {
    return (
        <DropdownPreview
            value={null}
            direction="asc"
            className={props.className}
            placeholder={props.emptyOptionCaption}
            options={[{ caption: "optionCaption", value: "option" }]}
            screenReaderButtonCaption={props.screenReaderButtonCaption}
            screenReaderInputCaption={props.screenReaderInputCaption}
            styles={parseStyle(props.style)}
        />
    );
}
