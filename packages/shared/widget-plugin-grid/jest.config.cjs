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
        "^big\\.js$": "<rootDir>/../../../node_modules/big.js/big.js",
        "(.+)\\.js": "$1"
    },
    extensionsToTreatAsEsm: [".ts"]
};
