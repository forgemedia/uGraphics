Promise.all([
    System.import('mocha'),
    System.import('chai'),
    System.import('lodash'),
    System.import('jquery')
]).then(modules => {
    if (window.initMochaPhantomJS) window.initMochaPhantomJS();
    
    let mocha = modules[0];
    mocha.setup('bdd');

    let chai = modules[1];
    window.Assertion = chai.Assertion;
    window.expect = chai.expect;
});
