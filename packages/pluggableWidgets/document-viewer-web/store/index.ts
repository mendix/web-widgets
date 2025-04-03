import { createContext } from "react";
import { DocumentViewerContainerProps } from "typings/DocumentViewerProps";

const DocumentContext = createContext<DocumentViewerContainerProps>({} as DocumentViewerContainerProps);

export { DocumentContext };
