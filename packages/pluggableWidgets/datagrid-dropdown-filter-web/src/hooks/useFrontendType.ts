type FrontendType = "select" | "combobox" | "tagPicker";

export function useFrontendType(props: { multiselect: boolean; filterable: boolean }): FrontendType {
    if (props.filterable) {
        return props.multiselect ? "tagPicker" : "combobox";
    }
    return "select";
}
