import { ReactElement, useMemo } from "react";
import { ComboboxPreviewProps } from "../typings/ComboboxProps";
import { SingleSelection } from "./components/SingleSelection/SingleSelection";
import { ComboboxCore } from "./core/ComboboxCore";
import { createPreviewContainer } from "./core/createPreviewContainer";
import { CB_TOKENS as CB } from "./core/tokens";
import { SingleSelector } from "./helpers/types";
import "./ui/Combobox.scss";

export const preview = (props: ComboboxPreviewProps): ReactElement => {
    const keepMenuOpen =
        props.showFooter ||
        (props.optionsSourceStaticDataSource.length > 0 && props.staticDataSourceCustomContentType !== "no");

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const core = useMemo(() => createPreviewContainer(props).get(CB.core) as ComboboxCore<SingleSelector>, [props]);
    return (
        <div className="widget-combobox widget-combobox-editor-preview">
            <SingleSelection core={core} vm={core.viewModel} keepMenuOpen={keepMenuOpen} />
        </div>
    );
};
