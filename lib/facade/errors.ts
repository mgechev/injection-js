import { DebugContext } from './lang';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export const ERROR_TYPE = 'ngType';
export const ERROR_COMPONENT_TYPE = 'ngComponentType';
export const ERROR_DEBUG_CONTEXT = 'ngDebugContext';
export const ERROR_ORIGINAL_ERROR = 'ngOriginalError';
export const ERROR_LOGGER = 'ngErrorLogger';

export function getType(error: Error): Function {
  return (error as any)[ERROR_TYPE];
}

export function getDebugContext(error: Error): DebugContext {
  return (error as any)[ERROR_DEBUG_CONTEXT];
}

export function getOriginalError(error: Error): Error {
  return (error as any)[ERROR_ORIGINAL_ERROR];
}

function defaultErrorLogger(console: Console, ...values: any[]) {
  (<any>console.error)(...values);
}

export function getErrorLogger(error: Error): (console: Console, ...values: any[]) => void {
  return (error as any)[ERROR_LOGGER] || defaultErrorLogger;
}

export function wrappedError(message: string, originalError: any): Error {
  const msg = `${message} caused by: ${originalError instanceof Error ? originalError.message : originalError}`;
  const error = Error(msg);
  (error as any)[ERROR_ORIGINAL_ERROR] = originalError;
  return error;
}
