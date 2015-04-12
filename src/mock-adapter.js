'use strict';

var debug = require('debug')('cc-adapter:couchbase:mock');

var Couchbase = require('couchbase').Mock,
    Adapter = require('./adapter');

function MockAdapterCouchbase() {
    Adapter.call(this, arguments);
}

MockAdapterCouchbase.prototype = Object.create(Adapter.prototype);
MockAdapterCouchbase.prototype.constructor = MockAdapterCouchbase;


// Expose the instance of Couchbase that we're using
MockAdapterCouchbase.prototype.Cb =
MockAdapterCouchbase.prototype.Couchbase = Couchbase;


/**
 * Connect to a Mocked Couchbase cluster and specified bucket
 *
 * @param {{host: string, bucket: string, bucketPassword: string}} options
 * @returns {AdapterCouchbase}
 */
MockAdapterCouchbase.prototype.connect = function connect(options) {
    options = options || {};

    debug('connecting to mock couchbase cluster');
    var cluster = new Couchbase.Cluster();
    var bucket = cluster.openBucket();

    // Set timeouts
    if (options.connectionTimeout)
        bucket.connectionTimeout = options.connectionTimeout;
    if (options.operationTimeout)
        bucket.operationTimeout = options.operationTimeout;
    if (options.viewTimeout)
        bucket.viewTimeout = options.viewTimeout;
    if (options.managementTimeout)
        bucket.managementTimeout = options.managementTimeout;

    this.options.cluster = cluster;
    this.options.bucket = bucket;

    return this;
};




module.exports = MockAdapterCouchbase;
