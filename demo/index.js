require('reflect-metadata');
const di = require('../dist');

const Http = di.Class({
  constructor: function () {}
});

const Service = di.Class({
  constructor: [Http, function (http) {
    this.http = http;
  }]
});

const injector = di.ReflectiveInjector.resolveAndCreate([Http, Service]);

console.log(injector.get(Service) instanceof Service);
