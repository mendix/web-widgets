import { ReactElement } from "react";

import { ComboboxContainerProps } from "../typings/ComboboxProps";

import { MultiSelection } from "./components/MultiSelection/MultiSelection";
import { Placeholder } from "./components/Placeholder";
import { SingleSelection } from "./components/SingleSelection/SingleSelection";
import { ComboboxCore } from "./core/ComboboxCore";
import { MultiSelector, SingleSelector } from "./helpers/types";
import { useActionEvents } from "./hooks/useActionEvents";
import { useComboboxCore } from "./hooks/useComboboxCore";

import "./ui/Combobox.scss";

export default function Combobox(props: ComboboxContainerProps): ReactElement {
    const { core, vm } = useComboboxCore(props);
    const actionEvents = useActionEvents({
        onEnterEvent: props.onEnterEvent,
        onLeaveEvent: props.onLeaveEvent,
        selector: core.selector
    });

    return (
        <div className="widget-combobox" {...actionEvents}>
            {vm.status === "unavailable" ? (
                <Placeholder />
            ) : vm.mode === "single" ? (
                // The casts go once the views stop taking the selector (migration step 3).
                <SingleSelection core={core as ComboboxCore<SingleSelector>} vm={vm} />
            ) : (
                <MultiSelection core={core as ComboboxCore<MultiSelector>} vm={vm} />
            )}
        </div>
    );
}
