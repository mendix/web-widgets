/* eslint-disable @typescript-eslint/no-var-requires */

const swcrc = {
    module: {
        type: "commonjs"
    },
    jsc: {
        target: "es2021",
        transform: {
            react: {
                pragma: "createElement",
                throwIfNamespace: true,
                development: false,
                useBuiltins: false
            }
        }
    }
};

module.exports = {
    modulePathIgnorePatterns: ["<rootDir>/dist", "__tests__/inputs", "__tests__/outputs"],
    extensionsToTreatAsEsm: [".ts", ".tsx"],
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest", swcrc]
    },
    collectCoverage: !process.env.CI
};
