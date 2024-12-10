import { createElement, ReactElement } from "react";
import "../ui/FileIcons.scss";
import { mimeToCssIconClass } from "../utils/mimeToCssIconClass";

interface FileIconProps {
    mimeType: string;
}

export function FileIcon(props: FileIconProps): ReactElement {
    return <div className={mimeToCssIconClass(props.mimeType)}></div>;
}
