import { useTranslation } from "@mendix/widget-plugin-i18n/react/useTranslation";
import { Fragment, ReactElement, createElement } from "react";
import { formatKey } from "src/formatKey";
import { LocalizeContainerProps } from "../typings/LocalizeProps";

export function Localize({ tKey, component: Component }: LocalizeContainerProps): ReactElement {
    const i18n = useTranslation();

    if (!i18n) {
        return <Fragment />;
    }
    if (i18n.exists(tKey)) {
        return <Component className="mx-text">{i18n.t(tKey)}</Component>;
    }

    return <code>{formatKey(tKey)}</code>;
}
