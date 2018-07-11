const { Inject, ReflectiveInjector } = require('../dist');

class Http {}

class Service {
  static get parameters() {
    return [[new Inject(Http)]];
  }

  constructor(http) {
    this.http = http;
  }
}

const injector = ReflectiveInjector.resolveAndCreate([Http, Service]);

console.log(injector.get(Service) instanceof Service);
