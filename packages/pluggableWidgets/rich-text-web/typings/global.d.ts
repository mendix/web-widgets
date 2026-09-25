export interface MXGlobalObject {
    remoteUrl: string;
}

declare module "*.css";
declare module "*.scss";
declare module "lodash.merge";

declare global {
    interface Window {
        mx: MXGlobalObject;
    }
}
