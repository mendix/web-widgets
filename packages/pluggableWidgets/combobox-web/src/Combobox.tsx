import { ReactElement } from "react";
import { ComboboxContainerProps } from "../typings/ComboboxProps";
import { defaultClasses } from "./components/classes";
import { ComboboxView } from "./components/ComboboxView";
import { UnavailablePlaceholder } from "./components/UnavailablePlaceholder";
import { useComboboxCore } from "./hooks/useComboboxCore";
import "./ui/Combobox.scss";

export default function Combobox(props: ComboboxContainerProps): ReactElement {
    const { vm } = useComboboxCore(props);

    if (vm.status === "unavailable") {
        return (
            <div className={defaultClasses.root}>
                <UnavailablePlaceholder />
            </div>
        );
    }
    return <ComboboxView vm={vm} />;
}
