import { ObjectItem } from "mendix";
import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";

export interface EventsController {
    getProps(item: ObjectItem): ElementProps<HTMLDivElement>;
}
