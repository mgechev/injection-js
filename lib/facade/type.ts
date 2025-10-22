/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @whatItDoes Represents a type that a Component or other object is instances of.
 *
 * @description
 *
 * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is being represented by
 * the `MyCustomComponent` constructor function.
 *
 * @stable
 */
export const Type = Function;

export function isType(v: any): v is Type<any> {
  return typeof v === 'function';
}

/**
 * @description
 *
 * Represents an abstract class `T`, if applied to a concrete class it would stop being
 * instantiable.
 */
export interface AbstractType<T> extends Function {
  prototype: T;
}

export interface Type<T = object> extends Function {
  new (...args: any[]): T;
}
