import { ReactElement, createElement } from "react";
import { GoogleTagContainerProps } from "../typings/GoogleTagProps";
import {
    areParametersReady,
    executeCommand,
    getPredefinedValue,
    prepareParameters,
    useDojoOnNavigation,
    useOnAfterRenderExecution
} from "./utils";

export default function GoogleTag(props: GoogleTagContainerProps): ReactElement | null {
    if (props.widgetMode === "basic") {
        return <GoogleTagBasicPageView {...props} />;
    } else {
        return <GoogleTagAdvancedMode {...props} />;
    }
}

function GoogleTagBasicPageView(props: GoogleTagContainerProps): ReactElement | null {
    const runCommands = useOnAfterRenderExecution(false, () => {
        if (props.targetId && props.targetId.status !== "available") {
            return false;
        }
        if (!areParametersReady(props.parameters)) {
            return false;
        }

        // execute config if not yet executed
        executeCommand(
            "config",
            "",
            {
                send_page_view: false
            },
            props.targetId && props.targetId.value
        );

        // execute event page_view
        executeCommand(
            "event",
            "page_view",
            {
                page_location: getPredefinedValue("pageUrl"),
                client_id: getPredefinedValue("sessionId"),
                language: getPredefinedValue("userLocale"),
                page_title: getPredefinedValue("pageTitle"),
                mx_page_name: getPredefinedValue("pageName"),
                mx_module_name: getPredefinedValue("moduleName"),
                ...prepareParameters(props.parameters)
            },
            ""
        );

        return true;
    });

    useDojoOnNavigation(() => {
        runCommands();
    });

    return null;
}

function GoogleTagAdvancedMode(props: GoogleTagContainerProps): ReactElement | null {
    const runCommands = useOnAfterRenderExecution(props.sendEventsOn === "onRender", () => {
        if (props.targetId && props.targetId.status !== "available") {
            return false;
        }
        if (!areParametersReady(props.parameters)) {
            return false;
        }

        // at this point we have everything ready
        executeCommand(
            props.command,
            props.eventName,
            prepareParameters(props.parameters),
            props.targetId && props.targetId.value
        );

        return true;
    });

    if (props.sendEventsOn === "onNavigation") {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useDojoOnNavigation(() => {
            runCommands();
        });
    }

    return null;
}
