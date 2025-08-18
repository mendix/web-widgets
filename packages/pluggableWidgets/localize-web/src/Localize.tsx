import { useTranslation } from "@mendix/widget-plugin-i18n/react/useTranslation";
import { PluginI18n } from "@mendix/widget-plugin-i18n/types";
import { Fragment, ReactElement, createElement } from "react";
import { formatKey } from "src/formatKey";
import { useFormatParams } from "src/useFormatParams";
import { LocalizeContainerProps } from "../typings/LocalizeProps";

export function Localize(props: LocalizeContainerProps): ReactElement {
    const i18n = useTranslation();

    if (!i18n) {
        return <Fragment />;
    }
    if (!i18n.exists(props.tKey)) {
        return <code>{formatKey(props.tKey)}</code>;
    }

    return <Text {...props} i18n={i18n} />;
}

function Text(props: LocalizeContainerProps & { i18n: PluginI18n }): ReactElement {
    const { tKey, component: Component, i18n } = props;
    const [loading, params] = useFormatParams(props);

    if (loading) {
        return <Fragment />;
    }

    if (params) {
        return <Component className="mx-text">{i18n.t(tKey, params)}</Component>;
    }

    return <Component className="mx-text">{i18n.t(tKey)}</Component>;
}
