require('reflect-metadata');
var di = require('../dist/injection.bundle');

var Http = di.Class({
  constructor: function() {},
});

var Service = di.Class({
  constructor: [
    Http,
    function(http) {
      this.http = http;
    },
  ],
});

var injector = di.ReflectiveInjector.resolveAndCreate([Http, Service]);

console.log(injector.get(Service) instanceof Service);
