module.exports = {
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
    moduleNameMapper: {
        "^(\\..+)\\.js": "$1"
    },
    extensionsToTreatAsEsm: [".ts"],
    testEnvironment: "jsdom"
};
