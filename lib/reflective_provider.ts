/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { reflector } from './reflection/reflection';
import { Type } from './facade/type';

import { resolveForwardRef } from './forward_ref';
import { InjectionToken } from './injection_token';
import { Inject, Optional, Self, SkipSelf } from './metadata';
import { ClassProvider, ExistingProvider, FactoryProvider, Provider, TypeProvider, ValueProvider } from './provider';
import { invalidProviderError, mixingMultiProvidersWithRegularProvidersError, noAnnotationError } from './reflective_errors';
import { ReflectiveKey } from './reflective_key';

interface NormalizedProvider extends TypeProvider, ValueProvider, ClassProvider, ExistingProvider, FactoryProvider {}

/**
 * `Dependency` is used by the framework to extend DI.
 * This is internal to Angular and should not be used directly.
 */
export class ReflectiveDependency {
  constructor(public key: ReflectiveKey, public optional: boolean, public visibility: Self | SkipSelf | null) {}

  static fromKey(key: ReflectiveKey): ReflectiveDependency {
    return new ReflectiveDependency(key, false, null);
  }
}

const _EMPTY_LIST: any[] = [];

/**
 * An internal resolved representation of a {@link Provider} used by the {@link Injector}.
 *
 * It is usually created automatically by `Injector.resolveAndCreate`.
 *
 * It can be created manually, as follows:
 *
 * ### Example ([live demo](http://plnkr.co/edit/RfEnhh8kUEI0G3qsnIeT?p%3Dpreview&p=preview))
 *
 * ```typescript
 * var resolvedProviders = Injector.resolve([{ provide: 'message', useValue: 'Hello' }]);
 * var injector = Injector.fromResolvedProviders(resolvedProviders);
 *
 * expect(injector.get('message')).toEqual('Hello');
 * ```
 *
 * @experimental
 */
export interface ResolvedReflectiveProvider {
  /**
   * A key, usually a `Type<any>`.
   */
  key: ReflectiveKey;

  /**
   * Factory function which can return an instance of an object represented by a key.
   */
  resolvedFactories: ResolvedReflectiveFactory[];

  /**
   * Indicates if the provider is a multi-provider or a regular provider.
   */
  multiProvider: boolean;
}

// tslint:disable-next-line:class-name
export class ResolvedReflectiveProvider_ implements ResolvedReflectiveProvider {
  constructor(public key: ReflectiveKey, public resolvedFactories: ResolvedReflectiveFactory[], public multiProvider: boolean) {}

  get resolvedFactory(): ResolvedReflectiveFactory {
    return this.resolvedFactories[0];
  }
}

/**
 * An internal resolved representation of a factory function created by resolving {@link
 * Provider}.
 * @experimental
 */
export class ResolvedReflectiveFactory {
  constructor(
    /**
     * Factory function which can return an instance of an object represented by a key.
     */
    public factory: Function,
    /**
     * Arguments (dependencies) to the `factory` function.
     */
    public dependencies: ReflectiveDependency[]
  ) {}
}

/**
 * Resolve a single provider.
 */
function resolveReflectiveFactory(provider: NormalizedProvider): ResolvedReflectiveFactory {
  let factoryFn: Function;
  let resolvedDeps: ReflectiveDependency[];
  if (provider.useClass) {
    const useClass = resolveForwardRef(provider.useClass);
    factoryFn = reflector.factory(useClass);
    resolvedDeps = _dependenciesFor(useClass);
  } else if (provider.useExisting) {
    factoryFn = (aliasInstance: any) => aliasInstance;
    resolvedDeps = [ReflectiveDependency.fromKey(ReflectiveKey.get(provider.useExisting))];
  } else if (provider.useFactory) {
    factoryFn = provider.useFactory;
    resolvedDeps = constructDependencies(provider.useFactory, provider.deps);
  } else {
    factoryFn = () => provider.useValue;
    resolvedDeps = _EMPTY_LIST;
  }
  return new ResolvedReflectiveFactory(factoryFn, resolvedDeps);
}

/**
 * Converts the {@link Provider} into {@link ResolvedProvider}.
 *
 * {@link Injector} internally only uses {@link ResolvedProvider}, {@link Provider} contains
 * convenience provider syntax.
 */
function resolveReflectiveProvider(provider: NormalizedProvider): ResolvedReflectiveProvider {
  return new ResolvedReflectiveProvider_(
    ReflectiveKey.get(provider.provide),
    [resolveReflectiveFactory(provider)],
    provider.multi || false
  );
}

/**
 * Resolve a list of Providers.
 */
export function resolveReflectiveProviders(providers: Provider[]): ResolvedReflectiveProvider[] {
  const normalized = _normalizeProviders(providers, []);
  const resolved = normalized.map(resolveReflectiveProvider);
  const resolvedProviderMap = mergeResolvedReflectiveProviders(resolved, new Map());
  return Array.from(resolvedProviderMap.values());
}

/**
 * Merges a list of ResolvedProviders into a list where
 * each key is contained exactly once and multi providers
 * have been merged.
 */
export function mergeResolvedReflectiveProviders(
  providers: ResolvedReflectiveProvider[],
  normalizedProvidersMap: Map<number, ResolvedReflectiveProvider>
): Map<number, ResolvedReflectiveProvider> {
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const existing = normalizedProvidersMap.get(provider.key.id);
    if (existing) {
      if (provider.multiProvider !== existing.multiProvider) {
        throw mixingMultiProvidersWithRegularProvidersError(existing, provider);
      }
      if (provider.multiProvider) {
        for (let j = 0; j < provider.resolvedFactories.length; j++) {
          existing.resolvedFactories.push(provider.resolvedFactories[j]);
        }
      } else {
        normalizedProvidersMap.set(provider.key.id, provider);
      }
    } else {
      let resolvedProvider: ResolvedReflectiveProvider;
      if (provider.multiProvider) {
        resolvedProvider = new ResolvedReflectiveProvider_(provider.key, provider.resolvedFactories.slice(), provider.multiProvider);
      } else {
        resolvedProvider = provider;
      }
      normalizedProvidersMap.set(provider.key.id, resolvedProvider);
    }
  }
  return normalizedProvidersMap;
}

function _normalizeProviders(providers: Provider[], res: Provider[]): NormalizedProvider[] {
  providers.forEach(b => {
    if (b instanceof Type) {
      res.push({ provide: b, useClass: b });
    } else if (b && typeof b === 'object' && (b as any).provide !== undefined) {
      res.push(b as NormalizedProvider);
    } else if (b instanceof Array) {
      _normalizeProviders(b as Provider[], res);
    } else {
      throw invalidProviderError(b);
    }
  });

  return res as NormalizedProvider[];
}

export function constructDependencies(typeOrFunc: any, dependencies?: any[]): ReflectiveDependency[] {
  if (!dependencies) {
    return _dependenciesFor(typeOrFunc);
  } else {
    const params: any[][] = dependencies.map(t => [t]);
    return dependencies.map(t => _extractToken(typeOrFunc, t, params));
  }
}

function _dependenciesFor(typeOrFunc: any): ReflectiveDependency[] {
  const params = reflector.parameters(typeOrFunc);

  if (!params) return [];
  if (params.some(p => p == null)) {
    throw noAnnotationError(typeOrFunc, params);
  }
  return params.map(p => _extractToken(typeOrFunc, p, params));
}

function _extractToken(typeOrFunc: any, metadata: any[] | any, params: any[][]): ReflectiveDependency {
  let token: any = null;
  let optional = false;

  if (!Array.isArray(metadata)) {
    if (metadata instanceof Inject) {
      return _createDependency(metadata['token'], optional, null);
    } else {
      return _createDependency(metadata, optional, null);
    }
  }

  let visibility: Self | SkipSelf | null = null;

  for (let i = 0; i < metadata.length; ++i) {
    const paramMetadata = metadata[i];

    if (paramMetadata instanceof Type) {
      token = paramMetadata;
    } else if (paramMetadata instanceof Inject) {
      token = paramMetadata['token'];
    } else if (paramMetadata instanceof Optional) {
      optional = true;
    } else if (paramMetadata instanceof Self || paramMetadata instanceof SkipSelf) {
      visibility = paramMetadata;
    } else if (paramMetadata instanceof InjectionToken) {
      token = paramMetadata;
    }
  }

  token = resolveForwardRef(token);

  if (token != null) {
    return _createDependency(token, optional, visibility);
  } else {
    throw noAnnotationError(typeOrFunc, params);
  }
}

function _createDependency(token: any, optional: boolean, visibility: Self | SkipSelf | null): ReflectiveDependency {
  return new ReflectiveDependency(ReflectiveKey.get(token), optional, visibility);
}
