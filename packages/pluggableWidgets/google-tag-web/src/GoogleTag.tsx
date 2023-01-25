import { ReactElement, useEffect, useState } from "react";
import { GoogleTagContainerProps } from "../typings/GoogleTagProps";
import commonGtag from "./commonGtag";

function executeCommand(
    command: string,
    eventName: string,
    params: Record<string, string | boolean>,
    tagId: string
): void {
    const gtag = commonGtag!.getGtag();

    switch (command) {
        case "config": {
            commonGtag!.ensureGtagIncluded(tagId);
            gtag(command, tagId, params);
            break;
        }
        case "event": {
            gtag(command, eventName, params);
            break;
        }
        case "set": {
            gtag(command, params);
            break;
        }
    }
}

export default function GoogleTag(props: GoogleTagContainerProps): ReactElement | null {
    const [needsExecution, setNeedsExecution] = useState<boolean>(props.sendEventsOn !== "onNavigation");

    useEffect(() => {
        if (props.sendEventsOn === "onNavigation") {
            const handle = (window as any).dojo.connect((window as any).mx.ui.getContentForm(), "onNavigation", () => {
                setNeedsExecution(true);
            });

            return () => {
                (window as any).dojo.disconnect(handle);
            };
        }
    }, [props.sendEventsOn]);

    if (needsExecution) {
        if (props.targetId && props.targetId.status !== "available") {
            return null;
        }

        for (const p of props.parameters) {
            if (p.value.status !== "available") {
                return null;
            }
        }

        // at this point we have everything ready
        const command = props.command;
        const tagId = props.targetId && props.targetId.value;
        const eventName = props.eventName;
        const params = Object.fromEntries(
            props.parameters.map(p => {
                return [
                    p.name,
                    p.value.value === "false"
                        ? false
                        : p.value.value === "true"
                        ? true
                        : replaceFullPathToken(p.value.value)
                ];
            })
        );

        executeCommand(command, eventName, params, tagId);

        setNeedsExecution(false);
    }

    return null;
}

function replaceFullPathToken(value: string): string {
    const formPath = window.mx.ui.getContentForm().path;

    return value.replace("{{__ModuleAndPageName__}}", formPath.substring(0, formPath.length - 9));
}
