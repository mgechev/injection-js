const { inject, ReflectiveInjector } = require('../dist');

class Http {}

class Service {
  http = inject(Http);
}

const injector = ReflectiveInjector.resolveAndCreate([Http, Service]);

console.log(injector.get(Service) instanceof Service);
console.log(injector.get(Service).http instanceof Http);
