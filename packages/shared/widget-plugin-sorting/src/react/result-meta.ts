export interface Error<T> {
    hasError: true;
    error: T;
}

export interface Success<T> {
    hasError: false;
    value: T;
}

export type Result<TValue, TError> = Error<TError> | Success<TValue>;

export function error<T>(error: T): Error<T> {
    return { hasError: true, error };
}

export function value<T>(value: T): Success<T> {
    return { hasError: false, value };
}
