[![Build Status](https://travis-ci.org/mgechev/injection-js.svg?branch=master)](https://travis-ci.org/mgechev/injection-js)

# Dependency Injection

Dependency injection library for JavaScript and TypeScript in **5.2K**. It is an extraction of the Angular's dependency injection which means that it's feature complete, fast, reliable and well tested.

**Up-to-date with Angular 4.1**.

# Why not Angular version 5 and above?

Angular version 5 deprecated the `ReflectiveInjector` API and introduced `StaticInjector`. In short, the dependency injection in the newest versions of Angular will happen entirely compile-time so reflection will not be necessary.

However, if you want to use dependency injection in your Node.js, Vue, React, Vanilla JS, TypeScript, etc. application you won't be able to take advantage of `StaticInjector` the way that Angular will because your application won't be compatible with Angular compiler.

This means that **if you need dependency injection outside of Angular `@angular/core` is not an option. In such case, use `injection-js` for fast, small, reliable, high-quality, well designed and well tested solution.**

# How to use?

```
$ npm i injection-js --save
```

Note that for ES5 `Class` syntax and TypeScript you need a polyfill for the [Reflect API](http://www.ecma-international.org/ecma-262/6.0/#sec-reflection). You can use, for instance, [reflect-metadata](https://www.npmjs.com/package/reflect-metadata), or [`core-js` (`core-js/es7/reflect`)](https://www.npmjs.com/package/core-js).

## TypeScript

```ts
import 'reflect-metadata';
import { ReflectiveInjector, Injectable, Injector } from 'injection-js';

class Http {}

@Injectable()
class Service {
  constructor(private http: Http) {}
}

@Injectable()
class Service2 {
  constructor(private injector: Injector) {}
  
  getService(): void {
    console.log(this.injector.get(Service) instanceof Service);
  }
  
  createChildInjector(): void {
    const childInjector = ReflectiveInjector.resolveAndCreate([
      Service
    ], this.injector);
  }
}

const injector = ReflectiveInjector.resolveAndCreate([
  Service,
  Http
]);

console.log(injector.get(Service) instanceof Service);
```

**Note**: you will need to enable the TypeScript flags `experimentalDecorators` and `emitDecoratorMetadata` to make this work.

## ES6

```js
const { Inject, ReflectiveInjector } = require('injection-js');

class Http {}

class Service {
  static get parameters() {
    return [new Inject(Http)];
  }

  constructor(http) {
    this.http = http;
  }
}

const injector = ReflectiveInjector.resolveAndCreate([Http, Service]);

console.log(injector.get(Service) instanceof Service);
```

## ES5

```js
require('reflect-metadata');
var di = require('injection-js');

var Http = di.Class({
  constructor: function () {}
});

var Service = di.Class({
  constructor: [Http, function (http) {
    this.http = http;
  }]
});

var injector = di.ReflectiveInjector.resolveAndCreate([Http, Service]);

console.log(injector.get(Service) instanceof Service);
```

For full documentation click [here](https://angular.io/docs/ts/latest/guide/dependency-injection.html), [here](https://angular.io/docs/ts/latest/cookbook/dependency-injection.html) and [here](https://angular.io/docs/ts/latest/cookbook/ts-to-js.html#!#dependency-injection).

# License

MIT

