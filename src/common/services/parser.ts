/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Parser<T> {
  parse: (response: any) => Promise<T>;
}
