export function nanoid(size = 4): string {
    return Math.random()
        .toString(16)
        .slice(2, 2 + size);
}
