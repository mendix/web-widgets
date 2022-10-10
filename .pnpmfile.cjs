function readPackage(pkg, context) {
    if (pkg.name === "@mendix/pluggable-widgets-tools") {
        delete pkg.dependencies["react-native"];
    }

    return pkg;
}

module.exports = {
    hooks: {
        readPackage
    }
};
