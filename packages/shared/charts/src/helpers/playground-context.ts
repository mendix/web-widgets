import type { Data, Config, Layout } from "plotly.js-dist-min";
import { Context, createContext, useContext, useMemo } from "react";
import { EditorStore } from "./EditorStore";
import { ChartProps } from "../components/types";
import { EditableChartStore } from "../main";

export type PlaygroundData =
    | {
          plotData: Array<Partial<Data>>;
          store: EditorStore;
          configOptions: Partial<Config>;
          layoutOptions: Partial<Layout>;
      }
    | {
          type: "editor.data.v2";
          store: EditableChartStore;
          plotData: Array<Partial<Data>>;
          configOptions: Partial<Config>;
          layoutOptions: Partial<Layout>;
      };

// We use Symbol.for to make this symbol accessible through whole runtime.
const contextSymbol = Symbol.for("ChartsPlaygroundContext");

declare global {
    interface Window {
        [contextSymbol]: ReturnType<typeof getPlaygroundContext> | undefined;
    }
}

export function getPlaygroundContext(): Context<PlaygroundData | null> {
    return (window[contextSymbol] ??= createContext<PlaygroundData | null>(null));
}

export function usePlaygroundContext(): { error: Error } | { data: PlaygroundData } {
    const data = useContext(getPlaygroundContext());
    if (data === null) {
        return { error: new Error("Out of context: component is out of playground slot.") };
    }
    return { data };
}

export function usePlaygroundDataFactory(props: ChartProps, store: EditorStore): PlaygroundData {
    return useMemo<PlaygroundData>(
        () => ({
            store,
            layoutOptions: props.layoutOptions,
            configOptions: props.configOptions,
            plotData: props.data
        }),
        [props.layoutOptions, props.configOptions, props.data, store]
    );
}
