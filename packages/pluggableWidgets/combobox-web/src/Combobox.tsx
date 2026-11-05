import { ReactElement, Suspense } from "react";
import { ComboboxContainerProps } from "../typings/ComboboxProps";
import { defaultClasses } from "./components/classes";
import { ComboboxView } from "./components/ComboboxView";
import { uiVariantFromName, uiVariants } from "./components/uiRegistry";
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
    const variant = uiVariantFromName(props.name);
    if (variant !== undefined) {
        const View = uiVariants[variant];
        return (
            <Suspense fallback={<div className={defaultClasses.root} />}>
                <View vm={vm} />
            </Suspense>
        );
    }
    return <ComboboxView vm={vm} />;
}
