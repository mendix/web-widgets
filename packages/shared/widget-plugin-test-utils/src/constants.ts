import type { ValueStatus } from "mendix";

export const Status = Object.freeze({
    Available: "available" as ValueStatus.Available,
    Unavailable: "unavailable" as ValueStatus.Unavailable,
    Loading: "loading" as ValueStatus.Loading
});
