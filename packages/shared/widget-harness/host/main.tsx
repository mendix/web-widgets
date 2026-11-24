import { ReactElement, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { ScenarioFactory, ScenarioInstance } from "./scenario";
import { filters } from "../src/main";
import "./styles.scss";

const scenarios: Record<string, () => Promise<{ default: ScenarioFactory }>> = {
    "datagrid-basic": () => import("./scenarios/datagrid-basic")
};

function Host({ instance }: { instance: ScenarioInstance }): ReactElement {
    useSyncExternalStore(instance.harness.subscribe, () => instance.harness.version);
    return instance.render();
}

async function start(): Promise<void> {
    const name = new URLSearchParams(window.location.search).get("scenario") ?? "datagrid-basic";
    const load = scenarios[name];
    const root = document.getElementById("root")!;
    if (!load) {
        root.textContent = `Unknown scenario "${name}". Available: ${Object.keys(scenarios).join(", ")}`;
        return;
    }
    const instance = (await load()).default();
    Object.assign(window, { harness: { ...instance.expose, harness: instance.harness, filters } });
    // No StrictMode: Datagrid's setup runs once per mount, as in the Mendix client.
    createRoot(root).render(<Host instance={instance} />);
}

start();
