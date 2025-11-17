import { createContext, ReactNode, useContext } from "react";
import { BarcodeConfig } from "./Barcode.config";

const BarcodeContext = createContext<BarcodeConfig | null>(null);

interface BarcodeContextProviderProps {
    config: BarcodeConfig;
    children: ReactNode;
}

export function BarcodeContextProvider({ config, children }: BarcodeContextProviderProps): ReactNode {
    return <BarcodeContext.Provider value={config}>{children}</BarcodeContext.Provider>;
}

export function useBarcodeConfig(): BarcodeConfig {
    const config = useContext(BarcodeContext);
    if (!config) {
        throw new Error("useBarcodeConfig must be used within a BarcodeConfigProvider");
    }
    return config;
}
