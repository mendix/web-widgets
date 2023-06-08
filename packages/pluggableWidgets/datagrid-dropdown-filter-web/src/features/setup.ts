import { Option } from "../utils/types";

export function parseInitValues(values: string): string[] {
    return values.split(",").filter(x => x !== "");
}

export const EMPTY_OPTION_VALUE = "__EMPTY_VALUE__";

export function finalizeOptions(
    options: Option[],
    props: { multiSelect: boolean; emptyOptionCaption?: string }
): Option[] {
    return props.multiSelect
        ? options
        : [{ caption: props.emptyOptionCaption ?? "", value: EMPTY_OPTION_VALUE }, ...options];
}
