import { token } from "brandi";
import { DerivedPropsGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ComboboxConfig } from "./Combobox.config";
import { ComboboxCore } from "./ComboboxCore";
import { ComboboxGateProps } from "./ComboboxGate";
import { FilterInputEventService } from "./FilterInputEvent.service";
import { Selector } from "../helpers/types";

const label = (name: string): string => `Combobox[${name}]`;

/** Tokens to resolve the combobox core and its parts from the container. */
export const CB_TOKENS = {
    config: token<ComboboxConfig>(label("@config:ComboboxConfig")),
    /** The Mendix values the core derives from: texts, aria props, footer, filter-input action. */
    gate: token<DerivedPropsGate<ComboboxGateProps>>(label("@gate:mainGate")),
    setupService: token<SetupComponentHost & { setup(): () => void }>(label("@service:setupService")),
    filterInputEvent: token<FilterInputEventService>(label("@service:filterInputEvent")),
    /** The selector family picked for this instance: the model seam the core derives from. */
    selector: token<Selector>(label("@store:selector")),
    core: token<ComboboxCore>(label("@core:ComboboxCore"))
};
