const bindColor = (ansiColor: string) => (str: string) => `${ansiColor}${str}\x1b[0m`;

export const fgRed = bindColor("\x1b[31m");
export const fgGreen = bindColor("\x1b[32m");
export const fgYellow = bindColor("\x1b[33m");
export const fgBlue = bindColor("\x1b[34m");
export const fgMagenta = bindColor("\x1b[35m");
export const fgCyan = bindColor("\x1b[36m");
export const fgWhite = bindColor("\x1b[37m");
