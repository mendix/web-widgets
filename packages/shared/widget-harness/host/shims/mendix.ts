// The real `mendix` package only ships typings; const enums from it are inlined by tsc but not by esbuild.
export const ValueStatus = {
    Available: "available",
    Unavailable: "unavailable",
    Loading: "loading"
} as const;

export const FormatterType = {
    Number: "number",
    DateTime: "datetime"
} as const;
