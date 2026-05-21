import classNames from "classnames";
import { ReactElement } from "react";
import { PusherPreviewProps } from "typings/PusherProps";
import { getCaption } from "./Pusher.editorConfig";
import "./ui/PusherPreview.css";

export function preview(props: PusherPreviewProps): ReactElement {
    return <div className={classNames("widget-pusher-preview")}>{getCaption(props)}</div>;
}
