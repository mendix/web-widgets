import type { ReactElement } from "react";
import type { Harness } from "../src/props/Harness";

export interface ScenarioInstance {
    harness: Harness;
    /** Called on every harness change; must read live values so the widget gets fresh props. */
    render(): ReactElement;
    /** Extra handles exposed on `window.harness` for tests. */
    expose?: Record<string, unknown>;
}

export type ScenarioFactory = () => ScenarioInstance;
