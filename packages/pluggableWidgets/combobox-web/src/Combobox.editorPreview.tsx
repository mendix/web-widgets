import { ReactElement, useMemo } from "react";
import { ComboboxView } from "@mendix/combobox-kit/atlas";
import { CB_TOKENS as CB, createPreviewContainer } from "@mendix/combobox-kit/preview";
import { ComboboxPreviewProps } from "../typings/ComboboxProps";
import "./ui/Combobox.scss";

export const preview = (props: ComboboxPreviewProps): ReactElement => {
    const keepMenuOpen =
        props.showFooter ||
        (props.optionsSourceStaticDataSource.length > 0 && props.staticDataSourceCustomContentType !== "no");

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const core = useMemo(() => createPreviewContainer(props).get(CB.core), [props]);
    return <ComboboxView vm={core.viewModel} keepMenuOpen={keepMenuOpen} className="widget-combobox-editor-preview" />;
};
