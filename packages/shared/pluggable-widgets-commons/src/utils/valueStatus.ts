interface ErrorResult<T> {
    hasError: true;
    error: T;
}

interface OkResult<T> {
    hasError: false;
    value: T;
}

export type ValueMeta<TValue, TError> =
    | {
          hasError: true;
          error: TError;
      }
    | {
          hasError: false;
          value: TValue;
      };

export function error<T>(error: T): ErrorResult<T> {
    return { hasError: true, error };
}

export function value<T>(value: T): OkResult<T> {
    return { hasError: false, value };
}
