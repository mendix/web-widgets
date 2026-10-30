import { ComboboxContainerProps } from "../../typings/ComboboxProps";

/**
 * The Mendix values the core derives from. Everything else the widget receives is either static
 * (see `ComboboxConfig`) or consumed by the selector seam. The container props satisfy this type,
 * so the runtime gate is the container props gate itself; the editor preview builds one by hand.
 */
export type ComboboxGateProps = Pick<
    ComboboxContainerProps,
    | "ariaRequired"
    | "ariaLabel"
    | "noOptionsText"
    | "clearButtonAriaLabel"
    | "removeValueAriaLabel"
    | "selectAllButtonCaption"
    | "a11ySelectedValue"
    | "a11yOptionsAvailable"
    | "a11yInstructions"
    | "menuFooterContent"
    | "onChangeFilterInputEvent"
>;
