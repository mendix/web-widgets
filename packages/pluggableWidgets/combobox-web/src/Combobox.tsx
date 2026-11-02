import { ReactElement } from "react";
import { ComboboxContainerProps } from "../typings/ComboboxProps";
import { MultiSelection } from "./components/MultiSelection/MultiSelection";
import { Placeholder } from "./components/Placeholder";
import { SingleSelection } from "./components/SingleSelection/SingleSelection";
import { useComboboxCore } from "./hooks/useComboboxCore";
import "./ui/Combobox.scss";

export default function Combobox(props: ComboboxContainerProps): ReactElement {
    const { vm } = useComboboxCore(props);

    if (vm.status === "unavailable") {
        return (
            <div className="widget-combobox">
                <Placeholder />
            </div>
        );
    }
    return vm.mode === "single" ? <SingleSelection vm={vm} /> : <MultiSelection vm={vm} />;
}
