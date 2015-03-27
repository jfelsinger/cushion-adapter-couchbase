'use strict';

var debug = require('debug')('cc-adapter:couchbase')

var Couchbase = require('couchbase'),
    async = require('async');

/**
 * An adapter class for dealing with a Coucbase DB
 *
 * @class
 */
function AdapterCouchbase() {
    this.options = {};
}


// Expose the instance of Couchbase that we're using
AdapterCouchbase.prototype.Cb =
AdapterCouchbase.prototype.Couchbase = Couchbase;


/**
 * Sets or gets an option
 *
 * @param {string} option
 * @param {*} [value]
 * @returns {*}
 */
AdapterCouchbase.prototype.getOption =
AdapterCouchbase.prototype.setOption = function(option, value) {
    if (arguments.length === 2) {
        debug('setting option: ' + option + ' = ' + value);

        this.options[option] = value;

        return this;

    } else {
        debug('getting option: ' + option);

        return this.options[option];

    }
};


/**
 * Connect to a Couchbase cluster and specified bucket
 *
 * @param {{host: string, bucket: string, bucketPassword: string}} options
 * @returns {AdapterCouchbase}
 */
AdapterCouchbase.prototype.connect = function connect(options) {
    if (typeof(options.host) !== 'string' ||
        typeof(options.bucket) !== 'string')
        throw new Error('invalid options given for connection');

    var cluster = new Couchbase.Cluster(options.host);
    var bucket = options.bucketPassword ?
        cluster.openBucket(options.bucket, options.bucketPassword) :
        cluster.openBucket(options.bucket);

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


/**
 * Get objects from Couchbase
 */
AdapterCouchbase.prototype.get =
function get(names, cb) {
    if (!Array.isArray(names)) {
        debug('get (1) doc: ', names);
    } else {
        debug('get ('+names.length+') docs');
    }

    this.options.bucket.get.apply(
        this.options.bucket,
        arguments
    );

    return this;
};


/**
 * Save objects to Couchbase
 */
AdapterCouchbase.prototype.save =
function save(names, data, cb) {
    if (!Array.isArray(names)) {
        debug('save (1) doc: ', names);
        names = [names];
    } else {
        debug('save ('+names.length+') docs');
    }

    var requests = names.map(function(name) {
        return function(cb) {
            this.options.bucket.upsert(name, data, cb);
        }.bind(this);
    }.bind(this));

    async.parallel(requests, cb);

    return this;
};


/**
 * Remove objects from Couchbase
 */
AdapterCouchbase.prototype.del =
function del(names, cb) {
    if (!Array.isArray(names)) {
        debug('delete (1) doc: ', names);
    } else {
        debug('delete ('+names.length+') docs');
    }

    this.options.bucket.remove.apply(
        this.options.bucket,
        arguments
    );

    return this;
};


// --- Optional Methods ---


/**
 * Insert objects to Couchbase
 */
AdapterCouchbase.prototype.insert =
function insert(names, data, cb) {
    if (!Array.isArray(names)) {
        debug('insert (1) doc: ', names);
        names = [names];
    } else {
        debug('insert ('+names.length+') docs');
    }

    var requests = names.map(function(name) {
        return function(cb) {
            this.options.bucket.insert(name, data, cb);
        }.bind(this);
    }.bind(this));

    async.parallel(requests, cb);

    return this;
};


/**
 * Update objects in Couchbase
 */
AdapterCouchbase.prototype.update =
function update(names, data, cb) {
    if (!Array.isArray(names)) {
        debug('update (1) doc: ', names);
        names = [names];
    } else {
        debug('update ('+names.length+') docs');
    }

    var requests = names.map(function(name) {
        return function(cb) {
            this.options.bucket.replace(name, data, cb);
        }.bind(this);
    }.bind(this));

    async.parallel(requests, cb);

    return this;
};


/**
 * Query objects from Couchbase
 */
AdapterCouchbase.prototype.query =
function query(q, cb) {
    this.options.bucket.query.apply(
        this.options.bucket,
        arguments
    );

    return this;
}




module.exports = AdapterCouchbase;
