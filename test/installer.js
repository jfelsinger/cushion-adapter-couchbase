'use strict';

var adapterInstaller = require('..'),
    adapter = require('../src/adapter'),
    Methods = require('../src/cushion-methods'),
    CouchCushion = require('couch-cushion/src');

var should = require('should');

describe('Adapter Installer', function() {
    var cushion, methods;

    beforeEach(function() {
        cushion = new CouchCushion();
        methods = Methods(cushion);
    });

    describe('#install', function() {
        it('should install', function() {
            cushion.install(adapterInstaller);

            cushion._adapter.should.be.an.instanceof(adapter);

            for (var key in methods) {
                cushion[key].should.be.a.Function;
            }

            cushion.Cb.should.be.ok;
            cushion.Couchbase.should.be.ok;
        });

        it('should allow skipping properties', function() {
            cushion.install(adapterInstaller, { skipProperties: true });

            cushion._adapter.should.be.an.instanceof(adapter);

            for (var key in methods) {
                cushion[key].should.be.a.Function;
            }

            should(cushion.Cb).not.be.ok;
            should(cushion.Couchbase).not.be.ok;
        });

        it('should allow skipping methods', function() {
            cushion.install(adapterInstaller, { skipMethods: true });

            cushion._adapter.should.be.an.instanceof(adapter);

            for (var key in methods) {
                should(cushion[key]).not.be.ok;
            }

            cushion.Cb.should.be.ok;
            cushion.Couchbase.should.be.ok;
        });

        it('should allow skipping methods & properties', function() {
            cushion.install(adapterInstaller, {
                skipMethods: true,
                skipProperties: true
            });

            cushion._adapter.should.be.an.instanceof(adapter);

            for (var key in methods) {
                should(cushion[key]).not.be.ok;
            }

            should(cushion.Cb).not.be.ok;
            should(cushion.Couchbase).not.be.ok;
        });
    });

    describe('#get/setOption', function() {

        it('should set an option value', function() {
            adapterInstaller.setOption('test_option', 20);
            adapterInstaller.options.test_option.should.equal(20);
        });

        it('should get an option value', function() {
            adapterInstaller.options.test_option = 20;
            adapterInstaller.getOption('test_option').should.match(adapterInstaller.options.test_option);
        });

    });

});
