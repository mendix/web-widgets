function readPackage(pkg, context) {
    if (pkg) {
        switch (pkg.name) {
            case "@mendix/pluggable-widgets-tools": {
                delete pkg.dependencies["react-native"];
                break;
            }
            case "react-big-calendar":
            case "react-resize-detector": {
                pkg.peerDependencies["react"] = "^15.3.0 || ^16.0.0 || ^17.0.0";
                pkg.peerDependencies["react-dom"] = "^15.3.0 || ^16.0.0 || ^17.0.0";
                break;
            }
        }
    }

    return pkg;
}

module.exports = {
    hooks: {
        readPackage
    }
};
