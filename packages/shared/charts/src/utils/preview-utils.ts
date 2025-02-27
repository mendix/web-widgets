import { ComponentType, ReactNode } from "react";
import {
    StructurePreviewProps,
    container,
    rowLayout,
    dropzone
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { Problem } from "@mendix/pluggable-widgets-tools";

interface WidgetProps {
    showPlaygroundSlot: boolean;
    playground: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
}

export function checkSlot(props: WidgetProps): [Problem] | [] {
    if (props.playground.widgetCount > 0 && props.showPlaygroundSlot === false) {
        return [
            {
                property: "playground",
                message:
                    'Show playground is "No", but you have widget in playground slot. Please, remove widget from the playground slot.'
            }
        ];
    }
    return [];
}

export function withPlaygroundSlot(props: WidgetProps, children: StructurePreviewProps): StructurePreviewProps {
    return props.showPlaygroundSlot
        ? container()(
              rowLayout({
                  columnSize: "fixed"
              })(container({ grow: 1 })(), dropzone(dropzone.placeholder("Playground slot"))(props.playground)),
              children
          )
        : children;
}
