# Dependency Injection

Dependency injection library for JavaScript and TypeScript in **6.6K**. It is extraction of the Angular's dependency injection which means that it's feature complete, reliable and well tested.

# How to use?

```
$ npm i injection-js
```

## TypeScript

```ts
import 'reflect-metadata';
import { ReflectiveInjector, Injectable } from 'injection-js';

class Http {}

@Injectable()
class Service {
  constructor(private http: Http) {}
}

const injector = ReflectiveInjector.resolveAndCreate({
  Service,
  Http
});

injector.get(Service);
```

## ES5

```js
require('reflect-metadata');
var di = require('../dist');

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

For full documentation click [here](https://angular.io/docs/ts/latest/guide/dependency-injection.html).

# License

MIT

