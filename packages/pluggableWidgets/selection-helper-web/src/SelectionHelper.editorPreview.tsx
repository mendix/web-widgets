import { ReactElement, createElement } from "react";
import { SelectionHelperPreviewProps } from "../typings/SelectionHelperProps";
import { SelectionHelperComponent } from "./components/SelectionHelperComponent";

export function preview(props: SelectionHelperPreviewProps): ReactElement {
    return (
        <SelectionHelperComponent type={props.renderStyle} status="some">
            {props.renderStyle === "custom"
                ? [
                      <props.customAllSelected.renderer key={"all"}>
                          <div />
                      </props.customAllSelected.renderer>,
                      <props.customSomeSelected.renderer key={"some"}>
                          <div />
                      </props.customSomeSelected.renderer>,
                      <props.customNoneSelected.renderer key={"none"}>
                          <div />
                      </props.customNoneSelected.renderer>
                  ]
                : props.checkboxCaption}
        </SelectionHelperComponent>
    );
}

export function getPreviewCss(): string {
    return "";
}
