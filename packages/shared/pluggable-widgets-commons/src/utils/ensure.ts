export function ensure<T>(arg: T | undefined, msg = "Did not expect an argument to be undefined"): T {
    if (arg == null) {
        throw new Error(msg);
    }

    return arg;
}
