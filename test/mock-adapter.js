'use strict';

var Adapter = require('../src/mock-adapter'),
    async = require('async');

var should = require('should');

describe('Mock Adapter', function() {
    var adapter, cluster, bucket, docs;

    beforeEach(function(done) {
        adapter = new Adapter();
        adapter.connect();

        cluster = adapter.options.cluster;
        bucket = adapter.options.bucket;

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

    describe('#get', function() {
        it('should retrieve a document', function(done) {
            adapter.get('doc::1', function(err, res) {
                if (err) throw err;
                res.value.should.match(docs[0]);
                done();
            });
        });

        it('should retrieve multiple documents', function(done) {
            adapter.get(['doc::1','doc::2'], function(err, res) {
                if (err) throw err;
                res['doc::1'].value.should.match(docs[0]);
                res['doc::2'].value.should.match(docs[1]);
                done();
            });
        });
    });

    describe('#save', function() {
        it('should save a new doc', function(done) {
            var doc = { id:3, text:'test' };

            adapter.save('doc::3', doc, function(err, res) {
                if (err) throw err;

                bucket.get('doc::3', function(err, res) {
                    if (err) throw err;
                    res.value.should.match(doc);
                    done();
                });
            });
        });

        it('should update an existing doc', function(done) {
            docs[0].text = 'New Text';

            adapter.save('doc::1', docs[0], function(err, res) {
                if (err) throw err;

                bucket.get('doc::1', function(err, res) {
                    if (err) throw err;
                    res.value.should.match(docs[0]);
                    done();
                });
            });
        });

    });

    describe('#del', function() {
        it('should remove a document', function(done) {
            adapter.del('doc::1', function(err, res) {
                if (err) throw err;

                bucket.get('doc::1', function(err, res) {
                    err.message.should.equal('key not found');
                    should(res).be.null;
                    done();
                });
            });
        });

        //
        // This isn't in base couchbase, we can implement it later
        //
        // it('should remove multiple documents', function(done) {
        //     adapter.del(['doc::1','doc::2'], function(err, res) {
        //         if (err) throw err;

        //         async.parallel([
        //             function(cb) {
        //                 bucket.get('doc::1', function(err, res) {
        //                     err.message.should.equal('key not found');
        //                     should(res).be.null;
        //                     cb();
        //                 });
        //             },
        //             function(cb) {
        //                 bucket.get('doc::2', function(err, res) {
        //                     err.message.should.equal('key not found');
        //                     should(res).be.null;
        //                     cb();
        //                 });
        //             }
        //         ], function(err) {
        //             if (err) throw err;
        //             done();
        //         });
        //     });
        // });

    });

    describe('#insert', function() {
        it('should insert a new doc', function(done) {
            var doc = { id:3, text:'test' };

            adapter.insert('doc::3', doc, function(err, res) {
                if (err) throw err;

                bucket.get('doc::3', function(err, res) {
                    if (err) throw err;
                    res.value.should.match(doc);
                    done();
                });
            });
        });

        it('should not overwrite existing docs', function(done) {
            adapter.insert('doc::1', {}, function(err, res) {
                err.message.should.equal('key already exists');
                done();
            });
        });
    });

    describe('#update', function() {
        it('should not insert a new doc', function(done) {
            var doc = { id:3, text:'test' };

            adapter.update('doc::3', doc, function(err, res) {
                err.message.should.equal('key does not exist');
                done();
            });
        });

        it('should update an existing doc', function(done) {
            docs[0].text = 'New Text';

            adapter.save('doc::1', docs[0], function(err, res) {
                if (err) throw err;

                bucket.get('doc::1', function(err, res) {
                    if (err) throw err;
                    res.value.should.match(docs[0]);
                    done();
                });
            });
        });
    });
});

