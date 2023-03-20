import { ReactElement, createElement } from "react";
import { SelectionHelperPreviewProps } from "../typings/SelectionHelperProps";
import { SelectionHelperComponent } from "./components/SelectionHelperComponent";

export function preview(props: SelectionHelperPreviewProps): ReactElement {
    return (
        <SelectionHelperComponent
            type={props.renderStyle}
            status="some"
            className={props.class}
            cssStyles={props.styleObject}
        >
            {props.renderStyle === "custom"
                ? [
                      <props.customNoneSelected.renderer key={"none"} caption={"No items selected: Place widgets here"}>
                          <div />
                      </props.customNoneSelected.renderer>,
                      <props.customSomeSelected.renderer
                          key={"some"}
                          caption={"Some items selected: Place widgets here"}
                      >
                          <div />
                      </props.customSomeSelected.renderer>,
                      <props.customAllSelected.renderer key={"all"} caption={"All items selected: Place widgets here"}>
                          <div />
                      </props.customAllSelected.renderer>
                  ]
                : props.checkboxCaption}
        </SelectionHelperComponent>
    );
}

export function getPreviewCss(): string {
    return "";
}
