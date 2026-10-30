import { comboboxConfig } from "./Combobox.config";
import { ComboboxContainer } from "./Combobox.container";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";

export function createComboboxContainer(props: ComboboxContainerProps): ComboboxContainer {
    return new ComboboxContainer().init({ props, config: comboboxConfig(props) });
}
