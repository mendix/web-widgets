import { createContext, ReactNode, useContext } from "react";
import { BarcodeConfig } from "./Barcode.config";

const BarcodeConfigContext = createContext<BarcodeConfig | null>(null);

interface BarcodeConfigProviderProps {
    config: BarcodeConfig;
    children: ReactNode;
}

export function BarcodeConfigProvider({ config, children }: BarcodeConfigProviderProps): ReactNode {
    return <BarcodeConfigContext.Provider value={config}>{children}</BarcodeConfigContext.Provider>;
}

export function useBarcodeConfig(): BarcodeConfig {
    const config = useContext(BarcodeConfigContext);
    if (!config) {
        throw new Error("useBarcodeConfig must be used within a BarcodeConfigProvider");
    }
    return config;
}
