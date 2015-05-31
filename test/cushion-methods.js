'use strict';

var Adapter = require('../src/adapter'),
    Couchbase = require('couchbase').Mock,
    async = require('async');

var should = require('should');

describe('Cushion Methods', function() {
    var cushion, methods;

    beforeEach(function() {
        adapter = new Adapter();

        cluster = new Couchbase.Cluster();
        bucket = cluster.openBucket();

        adapter.options.cluster = cluster;
        adapter.options.bucket = bucket;

        docs = [{
            id: 1,
            text: 'A string',
            arr: ['matey','swab','pirates']
        },{
            id: 2,
            text: 'Another string',
            nin: ['throw', 'star', 'swords']
        }];

        async.parallel([
            function(cb) {
                bucket.upsert('doc::1', docs[0], cb);
            },
            function(cb) {
                bucket.upsert('doc::2', docs[1], cb);
            },
        ], function(err) {
            if (err) throw err;
            done();
        });
    });
});
