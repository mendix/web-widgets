function readPackage(pkg, context) {
    if (pkg.name === "@mendix/pluggable-widgets-tools") {
        delete pkg.dependencies["react-native"];
    }

    if (pkg && pkg.name === "react-big-calendar") {
        pkg.peerDependencies["react"] = "^15.3.0 || ^16.0.0 || ^17.0.0";
        pkg.peerDependencies["react-dom"] = "^15.3.0 || ^16.0.0 || ^17.0.0";
    }

    return pkg;
}

module.exports = {
    hooks: {
        readPackage
    }
};
