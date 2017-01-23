/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface BrowserNodeGlobal {
  Object: typeof Object;
  Array: typeof Array;
  Map: typeof Map;
  Set: typeof Set;
  Date: DateConstructor;
  RegExp: RegExpConstructor;
  JSON: typeof JSON;
  Math: any;  // typeof Math;
  assert(condition: any): void;
  Reflect: any;
  getAngularTestability: Function;
  getAllAngularTestabilities: Function;
  getAllAngularRootElements: Function;
  frameworkStabilizers: Array<Function>;
  setTimeout: Function;
  clearTimeout: Function;
  setInterval: Function;
  clearInterval: Function;
  encodeURI: Function;
}

// TODO(jteplitz602): Load WorkerGlobalScope from lib.webworker.d.ts file #3492
declare var WorkerGlobalScope: any /** TODO #9100 */;
// CommonJS / Node have global context exposed as "global" variable.
// We don't want to include the whole node.d.ts this this compilation unit so we'll just fake
// the global "global" var for now.
declare var global: any /** TODO #9100 */;

let globalScope: BrowserNodeGlobal;
if (typeof window === 'undefined') {
  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
    globalScope = <any>self;
  } else {
    globalScope = <any>global;
  }
} else {
  globalScope = <any>window;
}

// Need to declare a new variable for global here since TypeScript
// exports the original value of the symbol.
const _global: BrowserNodeGlobal = globalScope;

export {_global as global};

export function isPresent(obj: any): boolean {
  return obj != null;
}

export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (token == null) {
    return '' + token;
  }

  if (token.overriddenName) {
    return `${token.overriddenName}`;
  }

  if (token.name) {
    return `${token.name}`;
  }

  const res = token.toString();
  const newLineIndex = res.indexOf('\n');
  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}

