import { ComponentType } from "react";
import { Chip, ChipProps } from "./parts/Chip";
import { Clear, ClearProps } from "./parts/Clear";
import { InputContainer, InputContainerProps } from "./parts/InputContainer";
import { Loader, LoaderProps } from "./parts/Loader";
import { Menu, MenuProps } from "./parts/Menu";
import { NoOptions, NoOptionsProps } from "./parts/NoOptions";
import { Option, OptionProps } from "./parts/Option";
import { Placeholder, PlaceholderProps } from "./parts/Placeholder";
import { SelectAll, SelectAllProps } from "./parts/SelectAll";
import { Toggle, ToggleProps } from "./parts/Toggle";
import { Validation, ValidationProps } from "./parts/Validation";

/**
 * The components the Atlas View is assembled from, each one something a View author would
 * replace as a whole. Every part reads the resolved class map through `useComboboxClasses` and
 * receives the ViewModel and the Behavior props of its element, so a replacement keeps keyboard
 * and ARIA behaviour by spreading the same props. The root element, the input area and the
 * input itself stay in the View: they carry the Behavior wiring and nothing worth replacing.
 * See docs/design/headless-combobox.md, section 7.
 */
export interface ComboboxParts {
    InputContainer: ComponentType<InputContainerProps>;
    Placeholder: ComponentType<PlaceholderProps>;
    Chip: ComponentType<ChipProps>;
    Clear: ComponentType<ClearProps>;
    Toggle: ComponentType<ToggleProps>;
    Validation: ComponentType<ValidationProps>;
    Menu: ComponentType<MenuProps>;
    SelectAll: ComponentType<SelectAllProps>;
    Option: ComponentType<OptionProps>;
    NoOptions: ComponentType<NoOptionsProps>;
    Loader: ComponentType<LoaderProps>;
}

export const atlasParts: ComboboxParts = Object.freeze({
    InputContainer,
    Placeholder,
    Chip,
    Clear,
    Toggle,
    Validation,
    Menu,
    SelectAll,
    Option,
    NoOptions,
    Loader
});
