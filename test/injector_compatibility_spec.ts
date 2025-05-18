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

  it('should allow optional injection', () => {
    class Foo {}

    const { injector } = setup();

    const foo = runInInjectionContext(injector, () => inject(Foo, { optional: true }));

    expect(foo).toBeNull();
  });

  it('should support an abstract type as token', () => {
    abstract class AbstractFoo {}
    class Foo extends AbstractFoo {
      readonly bar = inject(Bar);
    }

    const { injector } = setup([
      {
        provide: AbstractFoo,
        useClass: Foo,
      },
    ]);

    const foo = runInInjectionContext(injector, () => inject(AbstractFoo));

    expect(foo).toBeDefined();
    expect(foo).toBeInstanceOf(Foo);
  });
  it('should support multi providers', () => {
    class Foo {}

    const { injector } = setup([
      {
        provide: Foo,
        useClass: Foo,
        multi: true,
      },
    ]);

    const foo = runInInjectionContext(injector, () => inject<Foo[]>(Foo));

    expect(foo.length).toBeGreaterThanOrEqual(1);
    foo.forEach((foo) => expect(foo).toBeInstanceOf(Foo));
  });

  it('should throw outside an injection context', () => {
    expect(() => inject(Bar)).toThrowError();
  });
});
