'use strict';

var adapterInstaller = require('..'),
    mockInstaller = adapterInstaller.Mock,
    adapter = require('../src/mock-adapter'),
    Methods = require('../src/cushion-methods'),
    CouchCushion = require('couch-cushion/src');

var should = require('should');

describe('Mock Adapter Installer', function() {
    var cushion, methods;

    beforeEach(function() {
        cushion = new CouchCushion();
        methods = Methods(cushion);
    });

    describe('#install', function() {
        it('should install', function() {
            cushion.install(mockInstaller);

            cushion._adapter.should.be.an.instanceof(adapter);

            for (var key in methods) {
                cushion[key].should.be.a.Function;
            }

            cushion.Cb.should.be.ok;
            cushion.Couchbase.should.be.ok;
        });

        it('should allow skipping properties', function() {
            cushion.install(mockInstaller, { skipProperties: true });

            cushion._adapter.should.be.an.instanceof(adapter);

            for (var key in methods) {
                cushion[key].should.be.a.Function;
            }

            should(cushion.Cb).not.be.ok;
            should(cushion.Couchbase).not.be.ok;
        });

        it('should allow skipping methods', function() {
            cushion.install(mockInstaller, { skipMethods: true });

            cushion._adapter.should.be.an.instanceof(adapter);

            for (var key in methods) {
                should(cushion[key]).not.be.ok;
            }

            cushion.Cb.should.be.ok;
            cushion.Couchbase.should.be.ok;
        });

        it('should allow skipping methods & properties', function() {
            cushion.install(mockInstaller, {
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

});
