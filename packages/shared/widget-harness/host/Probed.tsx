import { ComponentType, ReactElement } from "react";
import { recordProbe } from "../probe/probe.mjs";
import { filters } from "../src/main";

/** Records props like the probe injected into a real app's widget bundle (runtime/make-probe-mpk.mjs). */
export function probed<P extends { name: string }>(Widget: ComponentType<P>): (props: P) => ReactElement {
    return function Probed(props: P): ReactElement {
        recordProbe(props, filters);
        return <Widget {...props} />;
    };
}
