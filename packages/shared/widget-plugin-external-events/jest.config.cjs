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
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "(.+)\\.js": "$1"
    },
    extensionsToTreatAsEsm: [".ts", ".tsx"],
    transformIgnorePatterns: ["node_modules/(?!nanoevents)/"]
};
