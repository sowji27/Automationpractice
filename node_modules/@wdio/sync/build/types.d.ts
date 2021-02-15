import type Fiber from 'fibers';
import type Future from 'fibers/future';
export interface FiberConstructor {
    new (fn: Function): Fiber;
    (fn: Function): Fiber;
}
export interface FutureConstructor {
    new <T>(): Future<T>;
}
//# sourceMappingURL=types.d.ts.map