import { ReactElement, Suspense } from "react";
import { useComboboxCore } from "@mendix/combobox-kit";
import { ComboboxView, defaultClasses, UnavailablePlaceholder } from "@mendix/combobox-kit/atlas";
import { ComboboxContainerProps } from "../typings/ComboboxProps";
import { uiVariantFromName, uiVariants } from "./uiRegistry";
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
