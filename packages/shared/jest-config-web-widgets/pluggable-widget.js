const { resolve } = require("node:path");

const swcrc = {
    module: {
        type: "commonjs"
    },
    jsc: {
        // Ideally, target should be in sync with tsconfig target
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
    modulePathIgnorePatterns: ["<rootDir>/dist", "<rootDir>/cypress*"],
    moduleNameMapper: {
        "mendix/components/web/Icon": resolve(__dirname, "__mocks__/WebIcon"),
        "mendix/filters/builders": resolve(__dirname, "__mocks__/FilterBuilders"),
        "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    },
    extensionsToTreatAsEsm: [".ts", ".tsx"],
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest", swcrc]
    },
    collectCoverage: !process.env.CI,
    coverageDirectory: "<rootDir>/dist/coverage"
};
