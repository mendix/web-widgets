import { createContext, useContext } from "react";
import { ComboboxClasses, defaultClasses } from "../atlas/classes";

/**
 * The resolved class map of the View being rendered: the Atlas defaults with the View's
 * `classes` overrides applied. Provided by `ComboboxView`; outside it the defaults apply.
 */
export const ComboboxClassesContext = createContext<ComboboxClasses>(defaultClasses);

export function useComboboxClasses(): ComboboxClasses {
    return useContext(ComboboxClassesContext);
}
