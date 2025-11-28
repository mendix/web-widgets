import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { ObjectItem } from "mendix";

export interface EventsController {
    getProps(item: ObjectItem): ElementProps<HTMLDivElement>;
}
