import { Container, injected } from "brandi";
import { runInAction } from "mobx";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ComboboxConfig } from "./Combobox.config";
import { ComboboxCore } from "./ComboboxCore";
import { ComboboxSetupService } from "./ComboboxSetup.service";
import { FilterInputEventService } from "./FilterInputEvent.service";
import { CB_TOKENS as CB } from "./tokens";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { AssociationMultiSelector } from "../helpers/Association/AssociationMultiSelector";
import { AssociationSingleSelector } from "../helpers/Association/AssociationSingleSelector";
import { DatabaseMultiSelectionSelector } from "../helpers/Database/DatabaseMultiSelectionSelector";
import { DatabaseSingleSelectionSelector } from "../helpers/Database/DatabaseSingleSelectionSelector";
import { EnumBooleanSingleSelector } from "../helpers/EnumBool/EnumBoolSingleSelector";
import { StaticSingleSelector } from "../helpers/Static/StaticSingleSelector";
import { Selector } from "../helpers/types";

injected(AssociationSingleSelector, CB.config);
injected(AssociationMultiSelector, CB.config);
injected(DatabaseSingleSelectionSelector, CB.config);
injected(DatabaseMultiSelectionSelector, CB.config);
injected(FilterInputEventService, CB.setupService, CB.gate, CB.config);
injected(ComboboxCore, CB.selector, CB.config, CB.gate, CB.filterInputEvent);

type SelectorClass = new (config: ComboboxConfig) => Selector;

/** One selector class per family and mode. Enumeration and static selectors take no dependencies. */
function selectorClass({ family, mode }: ComboboxConfig): SelectorClass {
    switch (family) {
        case "enumeration":
            return EnumBooleanSingleSelector;
        case "association":
            return mode === "single" ? AssociationSingleSelector : AssociationMultiSelector;
        case "database":
            return mode === "single" ? DatabaseSingleSelectionSelector : DatabaseMultiSelectionSelector;
        case "static":
            return StaticSingleSelector;
    }
}

/**
 * The composition root of one widget instance. Bindings that do not depend on props are declared
 * in the constructor; `init` binds the config, the props gate and the selector family, and
 * returns the container ready for `get(CB.core)`.
 */
export class ComboboxContainer extends Container {
    id = `ComboboxContainer@${generateUUID()}`;

    constructor() {
        super();
        this.bind(CB.setupService).toInstance(ComboboxSetupService).inSingletonScope();
        this.bind(CB.filterInputEvent).toInstance(FilterInputEventService).inSingletonScope();
        this.bind(CB.core).toInstance(ComboboxCore).inSingletonScope();
    }

    init(dependencies: { props: ComboboxContainerProps; config: ComboboxConfig }): this {
        const { props, config } = dependencies;
        const provider = new GateProvider<ComboboxContainerProps>(props);

        this.bind(CB.config).toConstant(config);
        this.bind(CB.gate).toConstant(provider.gate);
        this.bind(CB.selector).toInstance(selectorClass(config)).inSingletonScope();

        // The selector seam still takes props by method call (migration step 3 replaces it with
        // derivations over the gate), so the props go through both in one action.
        const selector = this.get(CB.selector);
        selector.updateProps(props);
        this.setProps = next => {
            if (next === provider.gate.props) {
                return;
            }
            runInAction(() => {
                provider.setProps(next);
                selector.updateProps(next);
            });
        };

        return this;
    }

    /** Pushes the latest container props through the gate. A props object already seen is ignored. */
    setProps = (_props: ComboboxContainerProps): void => {
        throw new Error(`${this.id} is not initialized yet`);
    };
}
