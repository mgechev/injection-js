/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { KeyRegistry } from '../lib/reflective_key';

describe('key', function() {
  let registry: KeyRegistry;

  beforeEach(function() {
    registry = new KeyRegistry();
  });

  it('should be equal to another key if type is the same', function() {
    expect(registry.get('car')).toBe(registry.get('car'));
  });

  it('should not be equal to another key if types are different', function() {
    expect(registry.get('car')).not.toBe(registry.get('porsche'));
  });

  it('should return the passed in key', function() {
    expect(registry.get(registry.get('car'))).toBe(registry.get('car'));
  });
});
