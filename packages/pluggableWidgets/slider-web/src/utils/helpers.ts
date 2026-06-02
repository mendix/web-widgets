export { createValueFormatter, type ValueFormatter } from "@mendix/widget-plugin-platform/utils/number-formatter";

export const getSliderLabel = (sliderId: string): Element | null => document.querySelector(`label[for="${sliderId}"]`);
