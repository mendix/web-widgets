import { ReactElement, createElement, useRef } from "react";
import { GoogleTagContainerProps } from "../typings/GoogleTagProps";
import {
    areParametersReady,
    executeCommand,
    getPredefinedValue,
    prepareParameters,
    useDojoOnNavigation
} from "./utils";

export default function GoogleTag(props: GoogleTagContainerProps): ReactElement | null {
    if (props.widgetMode === "basic") {
        return <GoogleTagBasicPageView {...props} />;
    } else {
        return <GoogleTagAdvancedMode {...props} />;
    }
}

function GoogleTagBasicPageView(props: GoogleTagContainerProps): ReactElement | null {
    const needsExecution = useRef(true);

    const runCommands = (): void => {
        if (!needsExecution.current) {
            return;
        }
        if (props.targetId?.status !== "available") {
            return;
        }
        if (!areParametersReady(props.parameters)) {
            return;
        }

        const configProps = new Map<string, string | boolean>([["send_page_view", false]]);

        if (props.sendUserID && window.mx.session.getUserId() !== undefined) {
            configProps.set("user_id", window.mx.session.getUserId());
        }

        // execute config if not yet executed
        executeCommand("config", "", Object.fromEntries(configProps), props.targetId.value);

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

        needsExecution.current = false;
    };

    useDojoOnNavigation(() => {
        needsExecution.current = true;
        runCommands();
    });

    runCommands();

    return null;
}

function GoogleTagAdvancedMode(props: GoogleTagContainerProps): ReactElement | null {
    const needsExecution = useRef(true);

    const runCommand = (): void => {
        if (!needsExecution.current) {
            return;
        }

        if (!areParametersReady(props.parameters)) {
            return;
        }

        // at this point we have everything ready
        executeCommand(
            props.command,
            props.eventName,
            prepareParameters(props.parameters),
            props.targetId?.value ?? ""
        );

        needsExecution.current = false;
    };

    if (props.trackPageChanges) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useDojoOnNavigation(() => {
            needsExecution.current = true;
            runCommand();
        });
    }

    runCommand();

    return null;
}
