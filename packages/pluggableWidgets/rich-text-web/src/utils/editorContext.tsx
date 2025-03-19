import { ReactNode, createContext, createElement, useContext, useReducer } from "react";

interface EditorState {
    isFullscreen: boolean;
}

const initialState: EditorState = {
    isFullscreen: false
};

type EditorAction = { type: "ENTER_FULLSCREEN" } | { type: "EXIT_FULLSCREEN" };

function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case "ENTER_FULLSCREEN":
            return { ...state, isFullscreen: true };
        case "EXIT_FULLSCREEN":
            return { ...state, isFullscreen: false };
        default:
            return state;
    }
}

type EditorContextType = {
    state: EditorState;
    dispatch: React.Dispatch<EditorAction>;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

let _editorDispatch: React.Dispatch<EditorAction> | null = null;

// Export a function to dispatch actions from anywhere
export function dispatchEditorAction(action: EditorAction): void {
    if (_editorDispatch) {
        _editorDispatch(action);
    }
}

export function EditorProvider({ children }: { children: ReactNode }): JSX.Element {
    const [state, dispatch] = useReducer(editorReducer, initialState);

    _editorDispatch = dispatch;

    return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextType {
    const context = useContext(EditorContext);
    if (context === undefined) {
        return {
            state: initialState,
            dispatch: () => {
                /* no-op */
            }
        };
    }
    return context;
}

export function useFullscreen(): { isFullscreen: boolean; enterFullscreen: () => void; exitFullscreen: () => void } {
    const { state, dispatch } = useEditor();

    return {
        isFullscreen: state.isFullscreen,
        enterFullscreen: () => dispatch({ type: "ENTER_FULLSCREEN" }),
        exitFullscreen: () => dispatch({ type: "EXIT_FULLSCREEN" })
    };
}
