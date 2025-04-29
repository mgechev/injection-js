/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { Type } from './facade/type';
import { InjectionToken } from './injection_token';
import { Injector } from './injector';

/**
 * Current injector value used by `inject`.
 * - `undefined`: it is an error to call `inject`
 * - Injector instance: Use the injector for resolution.
 */
let _currentInjector: Injector | undefined = undefined;

export function getCurrentInjector(): Injector | undefined {
  return _currentInjector;
}

export function setCurrentInjector(injector: Injector | undefined): Injector | undefined {
  const former = _currentInjector;
  _currentInjector = injector;
  return former;
}

/**
 * Injects a token from the currently active injector. `inject` is only supported in an injection
 * context. It can be used during:
 * - Construction (via the `constructor`) of a class being instantiated by the DI system, such as an `@Injectable`.
 * - In the initializer for fields of such classes.
 * - In the factory function specified for `useFactory` of a {@link Provider} or an `@Injectable`.
 * - In a stack-frame of a function call in a DI context (e.g. {@link runInInjectionContext}).
 *
 * @param token A token that represents a dependency that should be injected.
 * @returns the injected value if operation is successful, `null` otherwise.
 * @throws - if called outside a supported context.
 *
 * @usageNotes
 * In practice the `inject()` calls are allowed in a constructor, a constructor parameter and a
 * field initializer:
 *
 * ```ts
 * @Injectable()
 * export class Car {
 *   radio: Radio | undefined;
 *   // OK: field initializer
 *   spareTyre = inject(Tyre);
 *
 *   constructor() {
 *     // OK: constructor body
 *     this.radio = inject(Radio);
 *   }
 * }
 * ```
 *
 * It is also legal to call `inject` from a provider's factory:
 *
 * ```ts
 * providers: [
 *   {
 *     provide: Car,
 *     useFactory: () => {
 *       // OK: a class factory
 *       const engine = inject(Engine);
 *       return new Car(engine);
 *     }
 *   }
 * ]
 * ```
 *
 * Calls to the `inject()` function outside the class creation context will result in an error. Most
 * notably, calls to `inject()` are disallowed after a class instance was created, in methods, if **not**
 * used in combination with {@link runInInjectionContext}.
 *
 * ```ts
 * @Injectable()
 * export class Car {
 *   init() {
 *     // ERROR: too late, the instance was already created
 *     const engine = inject(Engine);
 *     engine.start();
 *   }
 * }
 * ```
 *
 */
export function inject<T>(token: Type<T> | InjectionToken<T>): T {
  assertInInjectionContext(inject);

  return _currentInjector!.get(token);
}

/**
 * Runs the given function in the context of the given {@link Injector}.
 *
 * Within the function's stack frame, {@link inject} can be used to inject dependencies
 * from the given {@link Injector}. Note that {@link inject} is only usable synchronously, and cannot be used in
 * any asynchronous callbacks or after any `await` points.
 *
 * @param injector the injector which will satisfy calls to {@link inject} while `fn` is executing
 * @param fn the closure to be run in the context of {@link injector}
 * @returns the return value of the function, if any
 */
export function runInInjectionContext<ReturnT>(injector: Injector, fn: () => ReturnT): ReturnT {
  const prevInjector = setCurrentInjector(injector);
  try {
    return fn();
  } finally {
    setCurrentInjector(prevInjector);
  }
}

/**
 * Whether the current stack frame is inside an injection context.
 */
export function isInInjectionContext(): boolean {
  return getCurrentInjector() != null;
}

/**
 * Asserts that the current stack frame is within an injection context and has access to `inject`.
 *
 * @param debugFn a reference to the function making the assertion (used for the error message).
 */
export function assertInInjectionContext(debugFn: Function): void {
  // Taking a `Function` instead of a string name here prevents the unminified name of the function
  // from being retained in the bundle regardless of minification.
  if (!isInInjectionContext()) {
    throw new Error(
      debugFn.name +
        '() can only be used within an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`'
    );
  }
}
