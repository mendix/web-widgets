const pwtCfg = require("@mendix/pluggable-widgets-tools/test-config/jest.config");

module.exports = {
    /**
     * `nanoevents` package is ESM module and because ESM is not supported by Jest yet
     * we mark `nanoevents` as a module that should be transformed by ts-jest.
     */
    transformIgnorePatterns: ["node_modules/(?!nanoevents)/"],
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    transform: {
        "^.+\\.(t|j)sx?$": [
            "@swc/jest",
            {
                jsc: {
                    transform: {
                        react: {
                            runtime: "automatic"
                        }
                    }
                }
            }
        ]
    },
    moduleDirectories: ["node_modules", "src"],
    moduleNameMapper: {
        ...pwtCfg.moduleNameMapper,
        "big.js": "big.js",
        "(.+)\\.js": "$1"
    },
    extensionsToTreatAsEsm: [".ts"],
    testEnvironment: "jest-environment-jsdom",
    collectCoverage: !process.env.CI,
    coverageProvider: "v8",
    testMatch: ["<rootDir>/src/**/*.spec.{js,jsx,ts,tsx}"]
};
