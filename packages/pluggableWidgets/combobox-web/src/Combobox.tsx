import { ReactElement } from "react";
import { useComboboxCore } from "@mendix/combobox-kit";
import { ComboboxView, defaultClasses, UnavailablePlaceholder } from "@mendix/combobox-kit/atlas";
import { ComboboxContainerProps } from "../typings/ComboboxProps";
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
