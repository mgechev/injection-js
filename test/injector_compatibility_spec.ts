import { inject, Provider, ReflectiveInjector, runInInjectionContext } from '../lib';

class Bar {}

function setup(providers?: Provider[]) {
  const injector = ReflectiveInjector.resolveAndCreate([Bar, ...(providers ?? [])]);
  return { injector };
}

describe('inject()', () => {
  it('should work in a field initializer', () => {
    class Foo {
      readonly bar = inject(Bar);
    }

    const { injector } = setup([Foo]);
    const foo: Foo = injector.get(Foo);

    expect(foo).toBeDefined();
    expect(foo.bar).toBeDefined();
    expect(foo.bar).toBeInstanceOf(Bar);
  });
  it('should work in a class constructor', () => {
    class Foo {
      readonly bar: Bar;
      constructor() {
        this.bar = inject(Bar);
      }
    }

    const { injector } = setup([Foo]);
    const foo: Foo = injector.get(Foo);

    expect(foo).toBeDefined();
    expect(foo.bar).toBeDefined();
    expect(foo.bar).toBeInstanceOf(Bar);
  });
  it('should work in a factory function', () => {
    class Foo {
      constructor(readonly bar: Bar) {}
    }

    const { injector } = setup([
      {
        provide: Foo,
        useFactory: () => new Foo(inject(Bar)),
      },
    ]);
    const foo: Foo = injector.get(Foo);

    expect(foo).toBeDefined();
    expect(foo.bar).toBeDefined();
    expect(foo.bar).toBeInstanceOf(Bar);
  });
  it('should work within an injection context', () => {
    const { injector } = setup();
    const bar = runInInjectionContext(injector, () => inject(Bar));

    expect(bar).toBeDefined();
    expect(bar).toBeInstanceOf(Bar);
  });

  it('should throw outside an injection context', () => {
    expect(() => inject(Bar)).toThrowError();
  });
});
