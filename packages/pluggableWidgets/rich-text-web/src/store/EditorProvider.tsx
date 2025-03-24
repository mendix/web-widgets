import { createElement, createContext, ReactNode, useReducer } from "react";
import { EditorAction, editorReducer, EditorState, initialState } from "./store";

export const EditorContext = createContext<EditorState>(initialState);
export const EditorDispatchContext = createContext<React.Dispatch<EditorAction> | null>(null);

export function EditorProvider({ children }: { children: ReactNode }): JSX.Element {
    const [state, dispatch] = useReducer(editorReducer, initialState);

    return (
        <EditorContext.Provider value={state}>
            <EditorDispatchContext.Provider value={dispatch}>{children}</EditorDispatchContext.Provider>
        </EditorContext.Provider>
    );
}
