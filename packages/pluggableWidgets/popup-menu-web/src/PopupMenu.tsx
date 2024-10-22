import { ReactElement, createElement } from "react";

import { PopupMenuContainerProps } from "../typings/PopupMenuProps";
import { PopupMenu as PopupMenuComponent } from "./components/PopupMenu";

export default function PopupMenu(props: PopupMenuContainerProps): ReactElement {
    return <PopupMenuComponent {...props} />;
}
